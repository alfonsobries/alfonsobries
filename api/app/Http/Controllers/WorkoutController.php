<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\TracksPersonalDays;
use App\Models\WorkoutEntry;
use App\Workout\DailyRoutine;
use App\Workout\WorkoutExercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * The daily exercise routine: a fixed plan whose progress is counted in
 * sets. It lives outside the virtue section but feeds the body area through
 * the DailyRoutine contract.
 */
class WorkoutController extends Controller
{
    use TracksPersonalDays;

    /**
     * How far back the screen can look. The week strip needs seven days and
     * the calendar-free UI never scrolls further, so the payload stays small
     * however long the practice runs.
     */
    private const WINDOW_DAYS = 60;

    /**
     * The plan, the recent days and the running counters in one call — the
     * screen renders from it without a second round trip.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $days = WorkoutEntry::whereDate('date', '>=', now()->subDays(self::WINDOW_DAYS - 1)->toDateString())
            ->orderBy('date')
            ->get()
            ->groupBy(fn (WorkoutEntry $entry): string => $entry->date->toDateString())
            ->map(fn (Collection $entries, string $date): array => $this->present($date, $entries))
            ->values();

        return response()->json([
            'plan' => WorkoutExercise::plan(),
            'sets_total' => DailyRoutine::totalSets(),
            'data' => $days,
            'stats' => $this->stats(),
        ]);
    }

    /**
     * Set how many sets of one exercise are done on a day. The count is
     * absolute rather than a delta, so a tap replayed after being offline
     * lands on the same number instead of stacking.
     */
    public function update(Request $request, string $date, string $exercise): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if ($response = $this->validateDate($date)) {
            return $response;
        }

        $case = WorkoutExercise::tryFrom($exercise);

        if ($case === null) {
            return response()->json(['message' => 'Unknown exercise.'], 422);
        }

        $validated = $request->validate([
            'sets' => ['required', 'integer', 'min:0', 'max:'.$case->sets()],
        ]);

        $entry = WorkoutEntry::whereDate('date', $date)->where('exercise', $case->value)->first();

        if ($validated['sets'] === 0) {
            $entry?->delete();
        } elseif ($entry === null) {
            WorkoutEntry::create([
                'date' => $date,
                'exercise' => $case->value,
                'sets' => $validated['sets'],
                'completed_at' => now(),
            ]);
        } else {
            $entry->update(['sets' => $validated['sets']]);
        }

        $entries = WorkoutEntry::whereDate('date', $date)->get();

        return response()->json([
            'data' => $this->present($date, $entries),
            'stats' => $this->stats(),
        ]);
    }

    /**
     * @param  Collection<int, WorkoutEntry>  $entries
     * @return array<string, mixed>
     */
    private function present(string $date, Collection $entries): array
    {
        $sets = $entries->mapWithKeys(fn (WorkoutEntry $entry): array => [
            $entry->exercise->value => $entry->sets,
        ]);

        $done = (int) $sets->sum();

        return [
            'date' => $date,
            'exercises' => collect(WorkoutExercise::values())
                ->mapWithKeys(fn (string $exercise): array => [$exercise => (int) $sets->get($exercise, 0)])
                ->all(),
            'sets_done' => $done,
            'points' => DailyRoutine::pointsFor($done),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function stats(): array
    {
        $perDay = WorkoutEntry::orderBy('date')
            ->get(['date', 'sets'])
            ->groupBy(fn (WorkoutEntry $entry): string => $entry->date->toDateString())
            ->map(fn (Collection $entries): int => (int) $entries->sum('sets'));

        return [
            'streak' => $this->streak($perDay->keys()->all()),
            'full_days' => $perDay->filter(
                fn (int $sets): bool => $sets >= DailyRoutine::totalSets()
            )->count(),
            'total_days' => $perDay->count(),
        ];
    }

    /**
     * Consecutive days with at least one set, ending today — or yesterday,
     * since a day still in progress shouldn't read as broken.
     *
     * @param  list<string>  $dates
     */
    private function streak(array $dates): int
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
}
