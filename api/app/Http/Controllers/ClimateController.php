<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Climate\AcState;
use App\Climate\CarrierException;
use App\Climate\Climate;
use App\Climate\ClimateAutomation;
use App\Climate\Presence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClimateController extends Controller
{
    public function __construct(
        private readonly Climate $climate,
        private readonly ClimateAutomation $automation,
    ) {}

    public function index(): JsonResponse
    {
        if (! $this->climate->isConfigured()) {
            return response()->json(['data' => [
                'configured' => false,
                'units' => [],
                'automation' => $this->automation->toArray(),
            ]]);
        }

        try {
            $units = $this->climate->units();
        } catch (CarrierException $exception) {
            report($exception);

            return response()->json(['message' => __('climate.unreachable')], 503);
        }

        return response()->json(['data' => [
            'configured' => true,
            'units' => $units,
            'automation' => $this->automation->toArray(),
        ]]);
    }

    public function update(Request $request, string $unit): JsonResponse
    {
        $validated = $request->validate([
            'power' => ['sometimes', 'boolean'],
            'target_temperature' => ['sometimes', 'numeric', 'between:16,30'],
            'mode' => ['sometimes', Rule::in(['auto', 'cool', 'dry', 'heat', 'fan'])],
            'fan_speed' => ['sometimes', Rule::in(array_keys(AcState::FAN_SPEEDS))],
            'swing' => ['sometimes', Rule::in(array_keys(AcState::SWINGS))],
            'eco' => ['sometimes', 'boolean'],
            'turbo' => ['sometimes', 'boolean'],
            'sleep' => ['sometimes', 'boolean'],
        ]);

        if (! $this->climate->isConfigured()) {
            return response()->json(['message' => __('climate.not_configured')], 503);
        }

        try {
            return response()->json(['data' => $this->climate->update($unit, $validated)]);
        } catch (CarrierException $exception) {
            if ($exception->isUnitOffline()) {
                return response()->json(['message' => __('climate.unit_offline')], 409);
            }

            report($exception);

            return response()->json(['message' => __('climate.unreachable')], 503);
        }
    }

    public function automation(): JsonResponse
    {
        return response()->json(['data' => $this->automation->toArray()]);
    }

    public function updateAutomation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'home' => ['sometimes', 'array'],
            'home.latitude' => ['required_with:home', 'numeric', 'between:-90,90'],
            'home.longitude' => ['required_with:home', 'numeric', 'between:-180,180'],
            'home.radius' => ['sometimes', 'integer', 'between:50,1000'],
        ]);

        $this->automation->configure($validated);

        return response()->json(['data' => $this->automation->toArray()]);
    }

    public function presence(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state' => ['required', Rule::enum(Presence::class)],
        ]);

        try {
            $this->automation->recordPresence($request->user(), Presence::from($validated['state']));
        } catch (CarrierException $exception) {
            // The presence is saved; the scheduled check retries the restore.
            report($exception);
        }

        return response()->json(['data' => $this->automation->toArray()]);
    }
}
