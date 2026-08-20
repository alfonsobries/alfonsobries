<?php

namespace App\Jobs;

use App\Models\LineCall;
use App\Models\LineEvent;
use App\Notifications\LineAlertNotification;
use App\Services\Line\LineSync;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;
use Throwable;

/**
 * Applies a stored webhook event to the local mirror. The webhook
 * controller answers 200 immediately; everything with side effects
 * (notifications, broadcasts, audio archival) happens here.
 */
class ProcessLineEvent implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public LineEvent $event,
    ) {}

    public function handle(LineSync $sync): void
    {
        $object = $this->event->objectPayload();

        match (true) {
            Str::startsWith($this->event->type, 'sms.') => $sync->applyMessage(
                $object,
                notify: $this->event->type === 'sms.received',
            ),
            $this->event->type === 'ai.pickup' => $sync->markAiPickup($object),
            Str::startsWith($this->event->type, 'call.') => $this->handleCall($sync, $object),
            $this->event->type === 'voicemail.created' => $sync->applyVoicemail($object, notify: true),
            $this->event->type === 'number.paused',
            $this->event->type === 'number.released' => $this->alertNumberTrouble($sync),
            Str::startsWith($this->event->type, 'number.') => $sync->syncNumber(),
            $this->event->type === 'account.balance_low' => $sync->notifyAlfonso(new LineAlertNotification(
                'Line balance low',
                'The private line account is running out of balance — top it up before calls or messages start failing.',
            )),
            default => null,
        };

        $this->event->update(['processed_at' => now()]);
    }

    /**
     * @param  array<string, mixed>  $object
     */
    private function handleCall(LineSync $sync, array $object): void
    {
        $sync->applyCall($object, notify: true);

        if ($this->event->type === 'call.recorded') {
            $this->archiveRecording($object);
        }
    }

    /**
     * @param  array<string, mixed>  $object
     */
    private function archiveRecording(array $object): void
    {
        $providerId = $object['id'] ?? $object['call_id'] ?? null;

        if ($providerId === null) {
            return;
        }

        $call = LineCall::where('provider_id', $providerId)->first();

        if ($call !== null && $call->recording_path === null) {
            ArchiveLineAudio::dispatch($call);
        }
    }

    private function alertNumberTrouble(LineSync $sync): void
    {
        $sync->syncNumber();

        $state = Str::after($this->event->type, 'number.');

        $sync->notifyAlfonso(new LineAlertNotification(
            "Private line {$state}",
            'The number is no longer active. Everything verified with it depends on this line — review it at the provider now.',
        ));
    }

    public function failed(?Throwable $exception): void
    {
        report($exception ?? new \RuntimeException("Line event {$this->event->id} failed to process."));
    }
}
