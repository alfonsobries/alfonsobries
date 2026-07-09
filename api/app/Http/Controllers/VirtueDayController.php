<?php

namespace App\Http\Controllers;

use App\Models\VirtueDay;
use Carbon\Exceptions\InvalidFormatException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class VirtueDayController extends Controller
{
    /**
     * Every tracked day plus the running stats, so the screen renders from a
     * single call. The dataset stays tiny (one row per day), so no paging.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $days = VirtueDay::orderBy('date')
            ->get()
            ->map(fn (VirtueDay $day): array => $this->present($day))
            ->values();

        return response()->json(['data' => $days, 'stats' => $this->stats()]);
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

        return response()->json(['data' => $this->present($day), 'stats' => $this->stats()]);
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

        return response()->json(['data' => $this->present($day), 'stats' => $this->stats()]);
    }

    /**
     * A progression-stage image from one of the mascot sets — the wolf (the
     * full arc) or the tree (the compact dashboard companion). Served through
     * the API so the sets stay private to the authenticated family.
     */
    public function mascot(Request $request, string $set, int $stage): mixed
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $totals = [
            'wolf' => count(VirtueDay::STAGE_THRESHOLDS),
            'tree' => VirtueDay::TREE_STAGES,
        ];

        $path = resource_path(sprintf('illustrations/%s/%s-%02d.png', $set, $set, $stage));

        if (! isset($totals[$set]) || $stage < 1 || $stage > $totals[$set] || ! file_exists($path)) {
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

    /**
     * @return array<string, mixed>
     */
    private function present(VirtueDay $day): array
    {
        return [
            'date' => $day->date->toDateString(),
            'prayers_completed' => $day->prayers_completed_at !== null,
            'resolution' => $day->resolution,
        ];
    }

    /**
     * The streak counts calendar days since the last explicit miss (or since
     * tracking started) — an unmarked day stays pending and doesn't break it.
     *
     * @return array<string, int>
     */
    private function stats(): array
    {
        $first = VirtueDay::min('date');
        $lastMissed = VirtueDay::where('resolution', VirtueDay::RESOLUTION_MISSED)->max('date');

        $streak = 0;

        if ($first !== null) {
            $start = $lastMissed === null
                ? Carbon::parse((string) $first)
                : Carbon::parse((string) $lastMissed)->addDay();

            $streak = max(0, (int) $start->startOfDay()->diffInDays(now()->startOfDay()) + 1);
        }

        return [
            'streak' => $streak,
            'days_tracked' => $first === null
                ? 0
                : (int) Carbon::parse((string) $first)->startOfDay()->diffInDays(now()->startOfDay()) + 1,
            'kept_count' => VirtueDay::where('resolution', VirtueDay::RESOLUTION_KEPT)->count(),
            'missed_count' => VirtueDay::where('resolution', VirtueDay::RESOLUTION_MISSED)->count(),
            ...$this->progress(),
        ];
    }

    /**
     * The mascot progression: each kept day earns a point, a miss costs ten,
     * and crossing a checkpoint sets a floor the points can never fall below
     * again — a lapse is a setback, never a restart. The stage is the highest
     * threshold reached and drives which mascot image the app shows.
     *
     * @return array<string, int>
     */
    private function progress(): array
    {
        $points = 0;
        $floor = 0;

        $days = VirtueDay::whereNotNull('resolution')
            ->orderBy('date')
            ->pluck('resolution');

        foreach ($days as $resolution) {
            $points = $resolution === VirtueDay::RESOLUTION_KEPT
                ? $points + 1
                : max($floor, $points - VirtueDay::MISS_PENALTY);

            foreach (VirtueDay::CHECKPOINTS as $checkpoint) {
                if ($points >= $checkpoint) {
                    $floor = max($floor, $checkpoint);
                }
            }
        }

        $stage = 1;

        foreach (VirtueDay::STAGE_THRESHOLDS as $index => $threshold) {
            if ($points >= $threshold) {
                $stage = $index + 1;
            }
        }

        $nextThreshold = VirtueDay::STAGE_THRESHOLDS[$stage] ?? null;

        return [
            'points' => $points,
            'stage' => $stage,
            'stage_count' => count(VirtueDay::STAGE_THRESHOLDS),
            'next_stage_at' => $nextThreshold ?? $points,
            'tree_stage' => intdiv($stage + 1, 2),
            'tree_stage_count' => VirtueDay::TREE_STAGES,
        ];
    }
}
