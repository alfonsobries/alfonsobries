<?php

namespace App\Http\Controllers;

use App\Models\VirtueDay;
use App\Models\VirtueEntry;
use App\Virtue\VirtueHabit;
use App\Virtue\VirtueStats;
use Carbon\Exceptions\InvalidFormatException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;

class VirtueDayController extends Controller
{
    public function __construct(private readonly VirtueStats $stats) {}

    /**
     * Every tracked day plus the running stats, so the screen renders from a
     * single call. The dataset stays tiny (one row per day), so no paging.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $entries = VirtueEntry::orderBy('date')
            ->get()
            ->groupBy(fn (VirtueEntry $entry): string => $entry->date->toDateString());

        $days = VirtueDay::orderBy('date')
            ->get()
            ->map(fn (VirtueDay $day): array => $this->present($day, $entries->get($day->date->toDateString(), collect())))
            ->values();

        return response()->json(['data' => $days, 'stats' => $this->stats->summary()]);
    }

    /**
     * Mark a day's resolution as kept or missed — or clear it back to
     * pending. The date comes from the device so its local day wins.
     */
    public function updateResolution(Request $request, string $date): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if ($response = $this->validateDate($date)) {
            return $response;
        }

        $validated = $request->validate([
            'resolution' => ['present', 'nullable', Rule::in([VirtueDay::RESOLUTION_KEPT, VirtueDay::RESOLUTION_MISSED])],
        ]);

        $day = $this->dayFor($date);
        $day->update(['resolution' => $validated['resolution']]);

        return $this->dayResponse($day);
    }

    /**
     * Record that the daily prayers were completed. Idempotent — repeating
     * the sequence keeps the first completion time.
     */
    public function completePrayers(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        if ($response = $this->validateDate($validated['date'])) {
            return $response;
        }

        $day = $this->dayFor($validated['date']);

        if ($day->prayers_completed_at === null) {
            $day->update(['prayers_completed_at' => now()]);
        }

        return $this->dayResponse($day);
    }

    /**
     * Mark or clear one of the entry-tracked habits for a day. Marking is
     * idempotent (the first completion time wins); clearing deletes the
     * entry so the day goes back to pending.
     */
    public function updateHabit(Request $request, string $date, string $habit): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if ($response = $this->validateDate($date)) {
            return $response;
        }

        if (VirtueHabit::tryFrom($habit) === null) {
            return response()->json(['message' => 'Unknown habit.'], 422);
        }

        $validated = $request->validate([
            'completed' => ['required', 'boolean'],
        ]);

        $day = $this->dayFor($date);

        $entry = VirtueEntry::whereDate('date', $date)->where('habit', $habit)->first();

        if ($validated['completed'] && $entry === null) {
            VirtueEntry::create(['date' => $date, 'habit' => $habit, 'completed_at' => now()]);
        } elseif (! $validated['completed']) {
            $entry?->delete();
        }

        return $this->dayResponse($day);
    }

    /**
     * A progression-stage image from the virtue journey art. Layers stack as
     * cielo (mind) + tierra (body) + arbol (spirit). Game stages map onto the
     * smaller art arc via VirtueDay::journeyArtStage(). Legacy one-offs
     * (plate, knight) stay servable. Everything goes through the API so the
     * art stays private to the authenticated family.
     */
    public function mascot(Request $request, string $set, int $stage): mixed
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $journeySets = ['tierra', 'cielo', 'arbol'];
        $legacyTotals = [
            'plate' => 1,
            'knight' => 1,
        ];

        if (in_array($set, $journeySets, true)) {
            $max = count(VirtueDay::STAGE_THRESHOLDS);

            if ($stage < 1 || $stage > $max) {
                return response()->json(['message' => 'Unknown stage.'], 404);
            }

            $artStage = VirtueDay::journeyArtStage($stage);
            $path = resource_path(sprintf('illustrations/%s/%s-%02d.png', $set, $set, $artStage));
        } elseif (isset($legacyTotals[$set])) {
            if ($stage < 1 || $stage > $legacyTotals[$set]) {
                return response()->json(['message' => 'Unknown stage.'], 404);
            }

            $path = resource_path(sprintf('illustrations/%s/%s-%02d.png', $set, $set, $stage));
        } else {
            return response()->json(['message' => 'Unknown stage.'], 404);
        }

        if (! file_exists($path)) {
            return response()->json(['message' => 'Unknown stage.'], 404);
        }

        return response()->file($path, ['Cache-Control' => 'private, max-age=31536000, immutable']);
    }

    /**
     * The date column stores a midnight timestamp, so the lookup goes through
     * whereDate rather than a raw equality on the Y-m-d string.
     */
    private function dayFor(string $date): VirtueDay
    {
        return VirtueDay::whereDate('date', $date)->first() ?? VirtueDay::create(['date' => $date]);
    }

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

    private function dayResponse(VirtueDay $day): JsonResponse
    {
        $entries = VirtueEntry::whereDate('date', $day->date->toDateString())->get();

        return response()->json([
            'data' => $this->present($day->refresh(), $entries),
            'stats' => $this->stats->summary(),
        ]);
    }

    /**
     * @param  Collection<int, VirtueEntry>  $entries
     * @return array<string, mixed>
     */
    private function present(VirtueDay $day, Collection $entries): array
    {
        $completed = $entries->map(fn (VirtueEntry $entry): string => $entry->habit->value)->flip();

        return [
            'date' => $day->date->toDateString(),
            'prayers_completed' => $day->prayers_completed_at !== null,
            'resolution' => $day->resolution,
            'habits' => collect(VirtueHabit::values())
                ->mapWithKeys(fn (string $habit): array => [$habit => $completed->has($habit)])
                ->all(),
        ];
    }
}
