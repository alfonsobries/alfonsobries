<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessLineEvent;
use App\Models\LineEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Receives privacynumber.io webhook events. Public route (the provider has
 * no session), authenticated by the endpoint's signing secret: the
 * X-PrivacyNumber-Signature header carries `t=<ts>,v1=<hex>` where v1 is
 * HMAC-SHA256 of "<ts>.<raw body>". Requests older than five minutes are
 * rejected, and the unique event id makes delivery retries idempotent.
 */
class LineWebhookController extends Controller
{
    private const TOLERANCE_SECONDS = 300;

    public function __invoke(Request $request): JsonResponse
    {
        if (! $this->signatureIsValid($request)) {
            return response()->json(['message' => 'Invalid signature.'], 403);
        }

        $payload = $request->json()->all();
        $eventId = $payload['id'] ?? null;
        $type = $payload['type'] ?? null;

        if (! is_string($eventId) || ! is_string($type)) {
            return response()->json(['message' => 'Malformed event.'], 400);
        }

        $event = LineEvent::firstOrCreate(
            ['provider_event_id' => $eventId],
            ['type' => $type, 'payload' => $payload],
        );

        if ($event->wasRecentlyCreated) {
            ProcessLineEvent::dispatch($event);
        }

        return response()->json(['message' => 'ok']);
    }

    private function signatureIsValid(Request $request): bool
    {
        $secret = (string) config('services.privacynumber.webhook_secret');

        if ($secret === '') {
            return false;
        }

        $parts = [];

        foreach (explode(',', (string) $request->header('X-PrivacyNumber-Signature')) as $pair) {
            [$key, $value] = array_pad(explode('=', trim($pair), 2), 2, '');
            $parts[$key] = $value;
        }

        $timestamp = $parts['t'] ?? '';
        $signature = $parts['v1'] ?? '';

        if (! ctype_digit($timestamp) || $signature === '') {
            return false;
        }

        if (abs(now()->getTimestamp() - (int) $timestamp) > self::TOLERANCE_SECONDS) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$request->getContent(), $secret);

        return hash_equals($expected, $signature);
    }
}
