<?php

namespace App\Http\Controllers;

use App\Models\LineNumber;
use App\Services\Line\LineSync;
use App\Services\Line\PrivacyNumberClient;
use App\Services\Line\PrivacyNumberException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LineSettingsController extends Controller
{
    public function show(LineSync $sync): JsonResponse
    {
        $number = LineNumber::first() ?? $sync->syncNumber();

        return response()->json(['data' => ['number' => $number?->toApiPayload()]]);
    }

    /**
     * Pushes line settings to the provider: auto-renew on the number, the
     * AI screening config, and the on/off schedule when the provider
     * exposes it.
     */
    public function update(Request $request, LineSync $sync, PrivacyNumberClient $client): JsonResponse
    {
        $validated = $request->validate([
            'auto_renew' => ['sometimes', 'boolean'],
            'ai' => ['sometimes', 'array'],
            'on_off' => ['sometimes', 'array'],
        ]);

        $number = LineNumber::first() ?? $sync->syncNumber();

        if ($number === null) {
            return response()->json(['message' => 'The line is not configured yet.'], 422);
        }

        try {
            $numberPatch = array_filter([
                'auto_renew' => $validated['auto_renew'] ?? null,
                'on_off' => $validated['on_off'] ?? null,
            ], fn (mixed $value): bool => $value !== null);

            if ($numberPatch !== []) {
                $client->updateNumber($number->provider_id, $numberPatch);
            }

            if (array_key_exists('ai', $validated)) {
                $client->updateAiConfig($number->provider_id, $validated['ai']);
            }
        } catch (PrivacyNumberException $exception) {
            report($exception);

            return response()->json(['message' => 'The provider rejected the settings change.'], 422);
        }

        $number = $sync->syncNumber() ?? $number;

        return response()->json(['data' => ['number' => $number->toApiPayload()]]);
    }
}
