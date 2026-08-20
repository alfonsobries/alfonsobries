<?php

namespace App\Http\Controllers;

use App\Events\LineMessageUpdated;
use App\Models\LineMessage;
use App\Models\LineNumber;
use App\Services\Line\LineSync;
use App\Services\Line\PrivacyNumberClient;
use App\Services\Line\PrivacyNumberException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LineMessageController extends Controller
{
    /**
     * Sends an SMS from the private line. The app's client_key doubles as
     * the provider idempotency key, so the offline queue can replay the
     * request without ever double-sending.
     */
    public function store(Request $request, LineSync $sync, PrivacyNumberClient $client): JsonResponse
    {
        $validated = $request->validate([
            'to' => ['required', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
            'body' => ['required', 'string', 'max:1600'],
            'client_key' => ['nullable', 'uuid'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
        ]);

        if (isset($validated['client_key'])) {
            $existing = LineMessage::where('client_key', $validated['client_key'])->first();

            if ($existing !== null) {
                return response()->json(['data' => $existing->loadMissing('contact')->toApiPayload()]);
            }
        }

        $number = LineNumber::first() ?? $sync->syncNumber();

        if ($number === null) {
            return response()->json(['message' => 'The line is not configured yet.'], 422);
        }

        $contact = $sync->contactFor($validated['to']);

        $message = LineMessage::create([
            'client_key' => $validated['client_key'] ?? (string) Str::uuid7(),
            'line_contact_id' => $contact->id,
            'direction' => LineMessage::DIRECTION_OUT,
            'body' => $validated['body'],
            'status' => LineMessage::STATUS_QUEUED,
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'provider_created_at' => now(),
        ]);

        try {
            $sent = $client->sendSms(
                from: $number->provider_id,
                to: $validated['to'],
                body: $validated['body'],
                scheduledAt: $message->scheduled_at?->toIso8601String(),
                idempotencyKey: $message->client_key,
            );
        } catch (PrivacyNumberException $exception) {
            report($exception);

            $message->update([
                'status' => LineMessage::STATUS_FAILED,
                'failure_code' => $exception->errorCode,
            ]);

            LineMessageUpdated::dispatch($message->loadMissing('contact'));

            return response()->json([
                'message' => 'The message could not be sent.',
                'data' => $message->toApiPayload(),
            ], 422);
        }

        $message = $this->reconcileSent($message, $sent);

        LineMessageUpdated::dispatch($message->loadMissing('contact'));

        return response()->json(['data' => $message->toApiPayload()], 201);
    }

    /**
     * A webhook can land with the same provider id before this request
     * writes it; fold onto that row so the unique constraint never fires.
     *
     * @param  array<string, mixed>  $sent
     */
    private function reconcileSent(LineMessage $message, array $sent): LineMessage
    {
        $providerId = $sent['id'] ?? null;

        if (is_string($providerId) && $providerId !== '') {
            $existing = LineMessage::where('provider_id', $providerId)
                ->whereKeyNot($message->id)
                ->first();

            if ($existing !== null) {
                $existing->update(['client_key' => $message->client_key]);
                $message->delete();

                return $existing;
            }
        }

        $message->update([
            'provider_id' => $providerId,
            'segments' => (int) ($sent['segments'] ?? 1),
            'cost_usd' => $sent['cost_usd'] ?? null,
            'status' => $message->scheduled_at === null
                ? LineMessage::STATUS_SENT
                : LineMessage::STATUS_QUEUED,
        ]);

        return $message->refresh();
    }
}
