<?php

namespace App\Virtue;

use App\Models\VirtueDay;
use App\Models\VirtueEntry;
use App\Models\WorkoutEntry;
use App\Workout\DailyRoutine;
use Illuminate\Support\Carbon;

/**
 * Computes the practice's running stats: the headline streak, one score per
 * area, and the rosary counters. Spirit scores day by day — the rosary and
 * the prayers only ever add, a missed resolution outweighs a full prayer
 * day, an idle day drains one point — with checkpoint floors so every lapse
 * is a setback, never a restart. Body and mind score from their habit
 * entries — body also collects the daily exercise routine — and a missed
 * resolution costs them too.
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
        $spirit = $this->spiritArea($streak);

        return [
            'art_version' => JourneyArt::version(),
            'streak' => $streak,
            'days_tracked' => $first === null
                ? 0
                : (int) Carbon::parse((string) $first)->startOfDay()->diffInDays(now()->startOfDay()) + 1,
            'kept_count' => VirtueDay::where('resolution', VirtueDay::RESOLUTION_KEPT)->count(),
            'missed_count' => VirtueDay::where('resolution', VirtueDay::RESOLUTION_MISSED)->count(),
            // The soul is the headline: the top-level progression mirrors spirit.
            'points' => $spirit['points'],
            'stage' => $spirit['stage'],
            'stage_count' => $spirit['stage_count'],
            'next_stage_at' => $spirit['next_stage_at'],
            'tree_stage' => $spirit['stage'],
            'tree_stage_count' => $spirit['stage_count'],
            'rosary' => $this->rosary(),
            'areas' => [
                VirtueArea::Body->value => $this->entryArea(VirtueArea::Body),
                VirtueArea::Mind->value => $this->entryArea(VirtueArea::Mind),
                VirtueArea::Spirit->value => $spirit,
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
     * @return array<string, int>
     */
    private function rosary(): array
    {
        $dates = VirtueDay::whereNotNull('rosary_completed_at')
            ->orderBy('date')
            ->pluck('date')
            ->map(fn ($date): string => Carbon::parse((string) $date)->toDateString());

        $month = now()->format('Y-m');

        return [
            'total' => $dates->count(),
            'month' => $dates->filter(fn (string $date): bool => str_starts_with($date, $month))->count(),
            'streak' => $this->activityStreak($dates->all()),
        ];
    }

    /**
     * An area scored from habit entries — each one emits its points (a big
     * exercise session emits two) — plus the daily resolution, which touches
     * every area: kept adds one, a relapse takes what the area is charged for
     * it. Body also collects the daily routine, and everything exercise on a
     * day is capped together. The score never goes below zero, and an
     * unmarked day simply earns nothing.
     *
     * @return array<string, int>
     */
    private function entryArea(VirtueArea $area): array
    {
        $habits = array_map(fn (VirtueHabit $habit): string => $habit->value, VirtueHabit::forArea($area));

        $entries = VirtueEntry::whereIn('habit', $habits)
            ->orderBy('date')
            ->get(['date', 'habit', 'minutes', 'big']);

        $deltas = [];
        $exercise = [];

        foreach ($entries as $entry) {
            $date = $entry->date->toDateString();

            if ($entry->habit === VirtueHabit::Exercise) {
                $exercise[$date] = ($exercise[$date] ?? 0) + $entry->points();

                continue;
            }

            $deltas[$date] = ($deltas[$date] ?? 0) + $entry->points();
        }

        $routine = $area === VirtueArea::Body ? $this->routinePoints() : [];

        foreach ($routine as $date => $points) {
            $exercise[$date] = ($exercise[$date] ?? 0) + $points;
        }

        foreach ($exercise as $date => $points) {
            $deltas[$date] = ($deltas[$date] ?? 0) + min(VirtueDay::EXERCISE_DAILY_CAP, $points);
        }

        $resolutions = VirtueDay::whereNotNull('resolution')->orderBy('date')->get(['date', 'resolution']);

        foreach ($resolutions as $day) {
            $date = $day->date->toDateString();
            $deltas[$date] = ($deltas[$date] ?? 0) + ($day->resolution === VirtueDay::RESOLUTION_KEPT
                ? VirtueDay::RESOLUTION_POINTS
                : -VirtueDay::missPenalty($area));
        }

        ksort($deltas);

        $points = 0;

        foreach ($deltas as $delta) {
            $points = max(0, $points + $delta);
        }

        $dates = $entries->map(fn (VirtueEntry $entry): string => $entry->date->toDateString())->all();

        return [
            ...$this->stageData($area, $points),
            'streak' => $this->activityStreak(array_values(array_unique([...$dates, ...array_keys($routine)]))),
        ];
    }

    /**
     * What each day of the exercise routine emits into the body area.
     *
     * @return array<string, int>
     */
    private function routinePoints(): array
    {
        $sets = [];

        foreach (WorkoutEntry::orderBy('date')->get(['date', 'sets']) as $entry) {
            $date = $entry->date->toDateString();
            $sets[$date] = ($sets[$date] ?? 0) + $entry->sets;
        }

        return array_map(fn (int $done): int => DailyRoutine::pointsFor($done), $sets);
    }

    /**
     * The spirit score walks every calendar day from the first tracked date
     * through today: the rosary earns two, the prayers one, a kept resolution
     * one; a missed resolution costs three, and a past day with nothing at all
     * costs one. Checkpoint floors apply and points never go negative.
     *
     * @return array<string, int>
     */
    private function spiritArea(int $streak): array
    {
        $days = VirtueDay::orderBy('date')
            ->get(['date', 'resolution', 'prayers_completed_at', 'rosary_completed_at'])
            ->keyBy(fn (VirtueDay $day): string => $day->date->toDateString());

        if ($days->isEmpty()) {
            return [
                ...$this->stageData(VirtueArea::Spirit, 0),
                'streak' => $streak,
            ];
        }

        $points = 0;
        $floor = 0;

        $cursor = Carbon::parse($days->keys()->first())->startOfDay();
        $today = now()->startOfDay();

        while ($cursor->lte($today)) {
            $day = $days->get($cursor->toDateString());

            $delta = 0;

            if ($day !== null) {
                if ($day->rosary_completed_at !== null) {
                    $delta += VirtueDay::ROSARY_POINTS;
                }

                if ($day->prayers_completed_at !== null) {
                    $delta += VirtueDay::PRAYERS_POINTS;
                }

                if ($day->resolution === VirtueDay::RESOLUTION_KEPT) {
                    $delta += VirtueDay::RESOLUTION_POINTS;
                } elseif ($day->resolution === VirtueDay::RESOLUTION_MISSED) {
                    $delta -= VirtueDay::MISS_PENALTY;
                }
            }

            // A past day with no activity at all quietly drains; today still counts as in progress.
            if ($delta === 0 && ($day === null || $day->resolution === null) && $cursor->lt($today)) {
                $delta = -VirtueDay::IDLE_PENALTY;
            }

            $points = max($floor, $points + $delta);
            $floor = $this->floorFor($points, $floor);

            $cursor = $cursor->addDay();
        }

        return [
            ...$this->stageData(VirtueArea::Spirit, $points),
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
    private function stageData(VirtueArea $area, int $points): array
    {
        $thresholds = VirtueDay::stageThresholds($area);
        $stage = $this->stageFor($thresholds, $points);

        return [
            'points' => $points,
            'stage' => $stage,
            'stage_count' => VirtueDay::STAGE_COUNT,
            'next_stage_at' => $thresholds[$stage] ?? $points,
        ];
    }

    /**
     * @param  list<int>  $thresholds
     */
    private function stageFor(array $thresholds, int $points): int
    {
        $stage = 1;

        foreach ($thresholds as $index => $threshold) {
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
