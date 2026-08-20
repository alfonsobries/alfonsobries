<?php

namespace App\Services\Line;

use App\Events\LineCallUpdated;
use App\Events\LineMessageUpdated;
use App\Events\LineVoicemailUpdated;
use App\Jobs\ArchiveLineAudio;
use App\Jobs\ArchiveLineMedia;
use App\Models\LineCall;
use App\Models\LineContact;
use App\Models\LineMessage;
use App\Models\LineNumber;
use App\Models\LineVoicemail;
use App\Models\User;
use App\Notifications\LineIncomingCallNotification;
use App\Notifications\LineMessageNotification;
use App\Notifications\LineMissedCallNotification;
use App\Notifications\LineVoicemailNotification;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * Mirrors provider resources into the local tables — the single write path
 * shared by the webhook processor and the reconciliation command, so both
 * agree on state transitions, broadcasts and notifications.
 */
class LineSync
{
    public function __construct(
        private readonly PrivacyNumberClient $client,
    ) {}

    public function contactFor(string $e164): LineContact
    {
        return LineContact::firstOrCreate(['e164' => $e164]);
    }

    /**
     * @param  array<string, mixed>  $sms
     */
    public function applyMessage(array $sms, bool $notify = false): ?LineMessage
    {
        $providerId = $sms['id'] ?? null;
        $e164 = $this->counterpart($sms);

        if ($providerId === null || $e164 === null) {
            return null;
        }

        $inbound = $this->isInbound($sms);
        $contact = $this->contactFor($e164);

        $message = LineMessage::updateOrCreate(['provider_id' => $providerId], [
            'line_contact_id' => $contact->id,
            'direction' => $inbound ? LineMessage::DIRECTION_IN : LineMessage::DIRECTION_OUT,
            'body' => (string) ($sms['body'] ?? ''),
            'media_urls' => is_array($sms['media_urls'] ?? null) ? $sms['media_urls'] : null,
            'segments' => (int) ($sms['segments'] ?? 1),
            'status' => $inbound ? LineMessage::STATUS_RECEIVED : (string) ($sms['status'] ?? LineMessage::STATUS_SENT),
            'failure_code' => $sms['failure_code'] ?? null,
            'cost_usd' => $sms['cost_usd'] ?? null,
            'provider_created_at' => $this->timestamp($sms['created_at'] ?? null) ?? now(),
            'delivered_at' => $this->timestamp($sms['delivered_at'] ?? null),
        ]);

        if ($message->wasRecentlyCreated || $message->wasChanged()) {
            $message->loadMissing('contact');
            LineMessageUpdated::dispatch($message);
        }

        if ($message->wasRecentlyCreated && $message->media_paths === null && ($sms['media_urls'] ?? []) !== []) {
            ArchiveLineMedia::dispatch($message);
        }

        if ($notify && $message->wasRecentlyCreated && $inbound && ! $contact->blocked) {
            $this->notifyAlfonso(new LineMessageNotification($message));
        }

        return $message;
    }

    /**
     * @param  array<string, mixed>  $call
     */
    public function applyCall(array $call, bool $notify = false): ?LineCall
    {
        $providerId = $call['id'] ?? null;
        $e164 = $this->counterpart($call);

        if ($providerId === null || $e164 === null) {
            return null;
        }

        $inbound = $this->isInbound($call);
        $contact = $this->contactFor($e164);

        $record = LineCall::updateOrCreate(['provider_id' => $providerId], [
            'line_contact_id' => $contact->id,
            'direction' => $inbound ? LineCall::DIRECTION_IN : LineCall::DIRECTION_OUT,
            'status' => $this->callStatus($call, $inbound),
            'started_at' => $this->timestamp($call['started_at'] ?? null) ?? now(),
            'answered_at' => $this->timestamp($call['answered_at'] ?? null),
            'ended_at' => $this->timestamp($call['ended_at'] ?? null),
            'duration_sec' => (int) ($call['duration_sec'] ?? 0),
            'cost_usd' => $call['cost_usd'] ?? null,
        ]);

        if ($record->wasRecentlyCreated || $record->wasChanged()) {
            $record->loadMissing('contact');
            LineCallUpdated::dispatch($record);
        }

        if ($notify && $inbound && ! $contact->blocked) {
            $becameRinging = $record->wasRecentlyCreated && $record->status === LineCall::STATUS_RINGING;
            $becameMissed = $record->isMissed()
                && ($record->wasRecentlyCreated || $record->wasChanged('status'));

            if ($becameRinging) {
                $this->notifyAlfonso(new LineIncomingCallNotification($record));
            } elseif ($becameMissed) {
                $this->notifyAlfonso(new LineMissedCallNotification($record));
            }
        }

        return $record;
    }

    /**
     * @param  array<string, mixed>  $voicemail
     */
    public function applyVoicemail(array $voicemail, bool $notify = false): ?LineVoicemail
    {
        $providerId = $voicemail['id'] ?? null;
        $e164 = $this->counterpart($voicemail);

        if ($providerId === null || $e164 === null) {
            return null;
        }

        $contact = $this->contactFor($e164);

        $callId = $voicemail['call_id'] ?? null;
        $call = $callId === null ? null : LineCall::where('provider_id', $callId)->first();

        if ($call !== null && $call->answered_by === null) {
            $call->update(['answered_by' => 'voicemail']);
        }

        $copy = $this->voicemailCopy($voicemail);

        $record = LineVoicemail::updateOrCreate(['provider_id' => $providerId], [
            'line_call_id' => $call?->id,
            'line_contact_id' => $contact->id,
            'transcript' => $copy['transcript'],
            'translation' => $copy['translation'],
            'summary' => $copy['summary'],
            'sentiment' => $copy['sentiment'],
            'duration_sec' => $voicemail['duration_sec'] ?? null,
            'received_at' => $this->timestamp($voicemail['received_at'] ?? $voicemail['created_at'] ?? null) ?? now(),
        ]);

        if ($record->wasRecentlyCreated || $record->wasChanged()) {
            $record->loadMissing('contact');
            LineVoicemailUpdated::dispatch($record);
        }

        if ($record->wasRecentlyCreated && $record->audio_path === null) {
            // The provider's audio URLs expire after an hour — archive now.
            ArchiveLineAudio::dispatch($record);
        }

        if ($notify && $record->wasRecentlyCreated && ! $contact->blocked) {
            $this->notifyAlfonso(new LineVoicemailNotification($record));
        }

        return $record;
    }

    /**
     * Pulls recent provider history and heals anything a lost webhook left
     * out. Quiet on purpose: webhooks own the notifications, this only
     * repairs data.
     */
    public function syncRecent(): void
    {
        if (! $this->client->isConfigured()) {
            return;
        }

        $this->client->eachPage('/sms', $this->applyMessage(...));
        $this->client->eachPage('/calls', $this->applyCall(...));
        $this->client->eachPage('/voicemails', $this->applyVoicemail(...));
    }

    /**
     * Refreshes the mirror of the provisioned number plus month-to-date
     * usage, so the settings screen renders without a live provider call.
     */
    public function syncNumber(): ?LineNumber
    {
        if (! $this->client->isConfigured()) {
            return null;
        }

        $number = $this->client->numbers()[0] ?? null;

        if ($number === null || ! isset($number['id'])) {
            return null;
        }

        $attributes = [
            'e164' => (string) ($number['number'] ?? ''),
            'display' => $number['display'] ?? null,
            'status' => (string) ($number['status'] ?? 'unknown'),
            'billing_period' => $number['billing_period'] ?? null,
            'renews_at' => $this->timestamp($number['renews_at'] ?? null),
            'auto_renew' => (bool) ($number['auto_renew'] ?? true),
            'ai_enabled' => (bool) ($number['ai_enabled'] ?? false),
            'on_off' => is_array($number['on_off'] ?? null) ? $number['on_off'] : null,
            'synced_at' => now(),
        ];

        try {
            $attributes['ai_config'] = $this->client->aiConfig($number['id']);
        } catch (Throwable $exception) {
            report($exception);
        }

        try {
            $attributes['usage'] = $this->client->usage();
        } catch (Throwable $exception) {
            report($exception);
        }

        try {
            $account = $this->client->account();
            $attributes['balance_usd'] = $account['balance_usd'] ?? null;
        } catch (Throwable $exception) {
            report($exception);
        }

        return LineNumber::updateOrCreate(['provider_id' => $number['id']], $attributes);
    }

    /**
     * The AI screening picked up the live call. The webhook's object is
     * the call; we keep the ringing → answered transition and flag who
     * answered so the incoming-call screen can say so.
     *
     * @param  array<string, mixed>  $call
     */
    public function markAiPickup(array $call): ?LineCall
    {
        $record = $this->applyCall([
            ...$call,
            'status' => $call['status'] ?? LineCall::STATUS_ANSWERED,
            'answered_at' => $call['answered_at'] ?? now()->toIso8601String(),
        ], notify: false);

        if ($record === null) {
            return null;
        }

        $record->update(['answered_by' => 'ai']);
        $record->loadMissing('contact');
        LineCallUpdated::dispatch($record);

        return $record;
    }

    public function notifyAlfonso(Notification $notification): void
    {
        try {
            User::alfonso()?->notify($notification);
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    /**
     * The other party's number: `from` on inbound traffic, `to` on outbound.
     *
     * @param  array<string, mixed>  $resource
     */
    private function counterpart(array $resource): ?string
    {
        if ($this->isInbound($resource)) {
            return $resource['from_e164'] ?? $resource['from'] ?? null;
        }

        return $resource['to'] ?? null;
    }

    /**
     * @param  array<string, mixed>  $resource
     */
    private function isInbound(array $resource): bool
    {
        return str_starts_with((string) ($resource['direction'] ?? ''), 'in');
    }

    /**
     * @param  array<string, mixed>  $call
     */
    private function callStatus(array $call, bool $inbound): string
    {
        $status = (string) ($call['status'] ?? LineCall::STATUS_RINGING);

        return match ($status) {
            'queued' => LineCall::STATUS_RINGING,
            'in_progress' => LineCall::STATUS_ANSWERED,
            'no_answer', 'busy' => $inbound ? LineCall::STATUS_MISSED : LineCall::STATUS_FAILED,
            LineCall::STATUS_COMPLETED => $inbound && ($call['answered_at'] ?? null) === null
                ? LineCall::STATUS_MISSED
                : LineCall::STATUS_COMPLETED,
            default => $status,
        };
    }

    /**
     * @param  array<string, mixed>  $voicemail
     * @return array{transcript: ?string, translation: ?string, summary: ?string, sentiment: ?string}
     */
    private function voicemailCopy(array $voicemail): array
    {
        $raw = $voicemail['transcript'] ?? null;

        if (is_array($raw)) {
            return [
                'transcript' => isset($raw['text']) && is_string($raw['text']) ? $raw['text'] : null,
                'translation' => isset($raw['translation_en']) && is_string($raw['translation_en'])
                    ? $raw['translation_en']
                    : (isset($raw['translation']) && is_string($raw['translation']) ? $raw['translation'] : null),
                'summary' => isset($raw['summary']) && is_string($raw['summary']) ? $raw['summary'] : null,
                'sentiment' => isset($raw['sentiment']) && is_string($raw['sentiment']) ? $raw['sentiment'] : null,
            ];
        }

        return [
            'transcript' => is_string($raw) ? $raw : null,
            'translation' => isset($voicemail['translation']) && is_string($voicemail['translation'])
                ? $voicemail['translation']
                : null,
            'summary' => isset($voicemail['summary']) && is_string($voicemail['summary'])
                ? $voicemail['summary']
                : null,
            'sentiment' => isset($voicemail['sentiment']) && is_string($voicemail['sentiment'])
                ? $voicemail['sentiment']
                : null,
        ];
    }

    private function timestamp(?string $value): ?Carbon
    {
        return $value === null ? null : Carbon::parse($value);
    }
}
