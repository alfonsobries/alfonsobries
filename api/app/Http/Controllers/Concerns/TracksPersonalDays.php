<?php

namespace App\Http\Controllers\Concerns;

use Carbon\Exceptions\InvalidFormatException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Shared rules for the personal day-by-day trackers: they belong to one
 * person, and they are keyed by the date the device thinks it is.
 */
trait TracksPersonalDays
{
    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isAlfonso()) {
            return response()->json(['message' => 'Not available.'], 403);
        }

        return null;
    }

    /**
     * The device sends its local date; a day of slack absorbs the timezone
     * gap between the device and the server.
     */
    private function validateDate(string $date): ?JsonResponse
    {
        try {
            $parsed = Carbon::createFromFormat('Y-m-d', $date);
        } catch (InvalidFormatException) {
            return response()->json(['message' => 'Invalid date.'], 422);
        }

        if ($parsed->format('Y-m-d') !== $date) {
            return response()->json(['message' => 'Invalid date.'], 422);
        }

        if ($parsed->startOfDay()->gt(now()->addDay()->startOfDay())) {
            return response()->json(['message' => 'The date cannot be in the future.'], 422);
        }

        return null;
    }
}
