<?php

namespace App\Virtue;

use App\Models\VirtueDay;
use App\Models\VirtueEntry;
use Illuminate\Support\Carbon;

/**
 * Computes the practice's running stats: the headline streak and mascot
 * progression (kept for the dashboard) plus one score per area. Habits feed
 * an area one point per completed day; only the daily resolution carries a
 * penalty, and checkpoint floors make every lapse a setback, never a restart.
 */
class VirtueStats
{
    /**
     * @return array<string, mixed>
     */
    public function summary(): array
    {
        $first = VirtueDay::min('date');
        $streak = $this->resolutionStreak($first);

        return [
            'streak' => $streak,
            'days_tracked' => $first === null
                ? 0
                : (int) Carbon::parse((string) $first)->startOfDay()->diffInDays(now()->startOfDay()) + 1,
            'kept_count' => VirtueDay::where('resolution', VirtueDay::RESOLUTION_KEPT)->count(),
            'missed_count' => VirtueDay::where('resolution', VirtueDay::RESOLUTION_MISSED)->count(),
            ...$this->progress(),
            'areas' => [
                VirtueArea::Body->value => $this->entryArea(VirtueArea::Body),
                VirtueArea::Mind->value => $this->entryArea(VirtueArea::Mind),
                VirtueArea::Spirit->value => $this->spiritArea($streak),
            ],
        ];
    }

    /**
     * The headline streak counts calendar days since the last explicit miss
     * (or since tracking started) — an unmarked day stays pending and doesn't
     * break it.
     */
    private function resolutionStreak(mixed $first): int
    {
        if ($first === null) {
            return 0;
        }

        $lastMissed = VirtueDay::where('resolution', VirtueDay::RESOLUTION_MISSED)->max('date');

        $start = $lastMissed === null
            ? Carbon::parse((string) $first)
            : Carbon::parse((string) $lastMissed)->addDay();

        return max(0, (int) $start->startOfDay()->diffInDays(now()->startOfDay()) + 1);
    }

    /**
     * Overall progress: each kept day earns a point, a miss costs ten, and
     * crossing a checkpoint sets a floor the points can never fall below
     * again. tree_stage mirrors stage (compact arbol icon).
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

            $floor = $this->floorFor($points, $floor);
        }

        $stage = $this->stageFor($points);

        return [
            'points' => $points,
            'stage' => $stage,
            'stage_count' => count(VirtueDay::STAGE_THRESHOLDS),
            'next_stage_at' => VirtueDay::STAGE_THRESHOLDS[$stage] ?? $points,
            'tree_stage' => $stage,
            'tree_stage_count' => count(VirtueDay::STAGE_THRESHOLDS),
        ];
    }

    /**
     * An area scored purely from habit entries: one point per completed day
     * per habit, no penalties — an unmarked day simply earns nothing.
     *
     * @return array<string, int>
     */
    private function entryArea(VirtueArea $area): array
    {
        $habits = array_map(fn (VirtueHabit $habit): string => $habit->value, VirtueHabit::forArea($area));

        $dates = VirtueEntry::whereIn('habit', $habits)
            ->orderBy('date')
            ->pluck('date')
            ->map(fn ($date): string => Carbon::parse((string) $date)->toDateString());

        return [
            ...$this->stageData(count($dates)),
            'streak' => $this->activityStreak($dates->unique()->values()->all()),
        ];
    }

    /**
     * The spirit score folds both of its modules in date order: a kept
     * resolution and a completed prayer sequence each earn a point, a missed
     * resolution costs ten, and the shared checkpoint floors apply.
     *
     * @return array<string, int>
     */
    private function spiritArea(int $streak): array
    {
        $points = 0;
        $floor = 0;

        $days = VirtueDay::where(fn ($query) => $query
            ->whereNotNull('resolution')
            ->orWhereNotNull('prayers_completed_at'))
            ->orderBy('date')
            ->get(['date', 'resolution', 'prayers_completed_at']);

        foreach ($days as $day) {
            if ($day->resolution === VirtueDay::RESOLUTION_MISSED) {
                $points = max($floor, $points - VirtueDay::MISS_PENALTY);
            } elseif ($day->resolution === VirtueDay::RESOLUTION_KEPT) {
                $points++;
            }

            if ($day->prayers_completed_at !== null) {
                $points++;
            }

            $floor = $this->floorFor($points, $floor);
        }

        return [
            ...$this->stageData($points),
            'streak' => $streak,
        ];
    }

    /**
     * Consecutive completed days ending today — or yesterday, since a day
     * still in progress shouldn't read as broken.
     *
     * @param  list<string>  $dates
     */
    private function activityStreak(array $dates): int
    {
        $set = array_flip($dates);
        $cursor = now()->startOfDay();

        if (! isset($set[$cursor->toDateString()])) {
            $cursor = $cursor->subDay();
        }

        $streak = 0;

        while (isset($set[$cursor->toDateString()])) {
            $streak++;
            $cursor = $cursor->subDay();
        }

        return $streak;
    }

    /**
     * @return array<string, int>
     */
    private function stageData(int $points): array
    {
        $stage = $this->stageFor($points);

        return [
            'points' => $points,
            'stage' => $stage,
            'stage_count' => count(VirtueDay::STAGE_THRESHOLDS),
            'next_stage_at' => VirtueDay::STAGE_THRESHOLDS[$stage] ?? $points,
        ];
    }

    private function stageFor(int $points): int
    {
        $stage = 1;

        foreach (VirtueDay::STAGE_THRESHOLDS as $index => $threshold) {
            if ($points >= $threshold) {
                $stage = $index + 1;
            }
        }

        return $stage;
    }

    private function floorFor(int $points, int $floor): int
    {
        foreach (VirtueDay::CHECKPOINTS as $checkpoint) {
            if ($points >= $checkpoint) {
                $floor = max($floor, $checkpoint);
            }
        }

        return $floor;
    }
}
