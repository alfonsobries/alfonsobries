<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Availability\AvailabilitySchedule;
use App\Models\SupportAvailability;
use App\Models\SupportBrand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Brands pull the rules here to reconcile missed pushes. No session: the
 * brand names itself in `X-Brand` and proves it with its own secret as a
 * bearer token. Until the schedule is saved once there are no rules to
 * share, so brands keep behaving as they did before.
 */
class AvailabilityRulesController extends Controller
{
    public function __invoke(Request $request, AvailabilitySchedule $schedule): JsonResponse
    {
        $brand = $this->authenticatedBrand($request);

        if ($brand === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $brand->forceFill(['last_pulled_at' => now()])->save();

        if (SupportAvailability::current()->version === 0) {
            return response()->json(['message' => 'No availability rules yet.'], 404);
        }

        return response()->json($schedule->rules()->toArray());
    }

    private function authenticatedBrand(Request $request): ?SupportBrand
    {
        $name = $request->header('X-Brand');
        $token = $request->bearerToken();

        if (! is_string($name) || $name === '' || ! is_string($token) || $token === '') {
            return null;
        }

        $brand = SupportBrand::query()->where('name', $name)->first();

        if ($brand === null || ! $brand->enabled || ! $brand->isConfigured()) {
            return null;
        }

        return hash_equals((string) $brand->secret, $token) ? $brand : null;
    }
}
