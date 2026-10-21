<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Availability\AvailabilitySchedule;
use App\Http\Requests\Availability\AvailabilityExceptionRequest;
use App\Models\SupportAvailabilityException;
use Illuminate\Http\JsonResponse;

/**
 * Vacations and other dated exceptions to the weekly schedule.
 */
class AvailabilityExceptionController extends Controller
{
    public function __construct(private readonly AvailabilitySchedule $schedule) {}

    public function store(AvailabilityExceptionRequest $request): JsonResponse
    {
        $this->schedule->change(function () use ($request): void {
            SupportAvailabilityException::query()->create($request->exceptionAttributes());
        });

        return response()->json(['data' => $this->schedule->toApiPayload()], 201);
    }

    public function update(AvailabilityExceptionRequest $request, SupportAvailabilityException $exception): JsonResponse
    {
        $this->schedule->change(function () use ($request, $exception): void {
            $exception->update($request->exceptionAttributes());
        });

        return response()->json(['data' => $this->schedule->toApiPayload()]);
    }

    public function destroy(SupportAvailabilityException $exception): JsonResponse
    {
        $this->schedule->change(function () use ($exception): void {
            $exception->delete();
        });

        return response()->json(['data' => $this->schedule->toApiPayload()]);
    }
}
