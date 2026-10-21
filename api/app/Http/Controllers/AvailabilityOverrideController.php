<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Availability\AvailabilitySchedule;
use App\Http\Requests\Availability\StoreAvailabilityOverrideRequest;
use App\Models\SupportAvailability;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

/**
 * The quick "right now" switch on top of the schedule.
 */
class AvailabilityOverrideController extends Controller
{
    public function __construct(private readonly AvailabilitySchedule $schedule) {}

    public function store(StoreAvailabilityOverrideRequest $request): JsonResponse
    {
        $mode = $request->mode();
        $until = $request->until($this->schedule);

        $this->schedule->change(function (SupportAvailability $availability) use ($mode, $until): void {
            $availability->override_mode = $mode;
            $availability->override_until = $until === null ? null : Carbon::instance($until);
        });

        return response()->json(['data' => $this->schedule->toApiPayload()]);
    }

    public function destroy(): JsonResponse
    {
        $this->schedule->change(function (SupportAvailability $availability): void {
            $availability->override_mode = null;
            $availability->override_until = null;
        });

        return response()->json(['data' => $this->schedule->toApiPayload()]);
    }
}
