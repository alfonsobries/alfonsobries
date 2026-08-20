<?php

namespace App\Http\Controllers;

use App\Events\LineCallUpdated;
use App\Models\LineCall;
use App\Models\LineNumber;
use App\Services\Line\LineSync;
use App\Services\Line\PrivacyNumberClient;
use App\Services\Line\PrivacyNumberException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LineCallController extends Controller
{
    private const PAGE_SIZE = 100;

    public function index(): JsonResponse
    {
        $calls = LineCall::with(['contact', 'voicemail'])
            ->orderByDesc('started_at')
            ->limit(self::PAGE_SIZE)
            ->get();

        return response()->json([
            'data' => $calls->map(fn (LineCall $call): array => $call->toApiPayload())->values(),
        ]);
    }

    /**
     * Places an outbound call from the private line. Where the caller-side
     * audio lands depends on the provider (see docs/plans/private-line.md,
     * spike S1); the record tracks the call state either way.
     */
    public function store(Request $request, LineSync $sync, PrivacyNumberClient $client): JsonResponse
    {
        $validated = $request->validate([
            'to' => ['required', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
            'callerid_mask' => ['required', Rule::in(['own', 'rotate', 'hide'])],
        ]);

        $number = LineNumber::first() ?? $sync->syncNumber();

        if ($number === null) {
            return response()->json(['message' => 'The line is not configured yet.'], 422);
        }

        try {
            $created = $client->createCall(
                from: $number->provider_id,
                to: $validated['to'],
                calleridMask: $validated['callerid_mask'] === 'own' ? $number->e164 : $validated['callerid_mask'],
            );
        } catch (PrivacyNumberException $exception) {
            report($exception);

            return response()->json(['message' => 'The call could not be placed.'], 422);
        }

        $call = LineCall::updateOrCreate(
            ['provider_id' => $created['id'] ?? 'local_'.uniqid()],
            [
                'line_contact_id' => $sync->contactFor($validated['to'])->id,
                'direction' => LineCall::DIRECTION_OUT,
                'status' => (string) ($created['status'] ?? LineCall::STATUS_RINGING),
                'started_at' => now(),
                'seen_at' => now(),
            ],
        );

        LineCallUpdated::dispatch($call->load('contact'));

        return response()->json(['data' => $call->toApiPayload()], 201);
    }

    public function hangup(LineCall $lineCall, PrivacyNumberClient $client): JsonResponse
    {
        try {
            $client->hangup($lineCall->provider_id);
        } catch (PrivacyNumberException $exception) {
            report($exception);

            return response()->json(['message' => 'The call could not be hung up.'], 422);
        }

        $lineCall->update([
            'status' => $lineCall->answered_at === null && $lineCall->direction === LineCall::DIRECTION_IN
                ? LineCall::STATUS_MISSED
                : LineCall::STATUS_COMPLETED,
            'ended_at' => now(),
            'seen_at' => $lineCall->seen_at ?? now(),
        ]);

        LineCallUpdated::dispatch($lineCall->load('contact'));

        return response()->json(['data' => $lineCall->toApiPayload()]);
    }

    /**
     * Clears the missed-call badge once the log has been looked at.
     */
    public function seen(): JsonResponse
    {
        LineCall::whereNull('seen_at')->update(['seen_at' => now()]);

        return response()->json(['data' => null]);
    }
}
