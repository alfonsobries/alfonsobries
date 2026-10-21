<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Availability\AvailabilitySchedule;
use App\Availability\Mode;
use App\Http\Requests\Availability\UpdateAvailabilityRequest;
use App\Models\SupportAvailability;
use App\Models\SupportBrand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Alfonso's support availability as the app edits it: the rules, the mode
 * they give right now, and each brand's sync state.
 */
class AvailabilityController extends Controller
{
    public function __construct(private readonly AvailabilitySchedule $schedule) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->schedule->toApiPayload()]);
    }

    public function update(UpdateAvailabilityRequest $request): JsonResponse
    {
        $this->schedule->change(function (SupportAvailability $availability) use ($request): void {
            $availability->fill([
                'timezone' => $request->validated('timezone'),
                'weekly' => AvailabilitySchedule::normalizeWeekly($request->weekly()),
                'outside_hours_mode' => Mode::from((string) $request->validated('outside_hours_mode')),
            ]);
        });

        return response()->json(['data' => $this->schedule->toApiPayload()]);
    }

    /**
     * Pushes the current rules again, to every enabled brand or to one.
     */
    public function resync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'brand' => ['nullable', 'string', Rule::exists('support_brands', 'name')->where('enabled', true)],
        ]);

        $brand = isset($validated['brand'])
            ? SupportBrand::query()->where('name', $validated['brand'])->firstOrFail()
            : null;

        if (SupportAvailability::current()->version > 0) {
            $this->schedule->pushToBrands($brand);
        }

        return response()->json(['data' => $this->schedule->toApiPayload()]);
    }
}
