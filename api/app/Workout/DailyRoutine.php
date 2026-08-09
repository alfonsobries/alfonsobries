<?php

namespace App\Workout;

/**
 * The routine's contract with the virtue core: a day of sets emits points
 * into the body area and nothing else. Finishing the whole routine is worth
 * three; anything short of it, as long as it isn't nothing, is worth one —
 * showing up on a bad day has to keep paying. The ceiling that caps this
 * together with the exercise habit lives on VirtueDay.
 */
class DailyRoutine
{
    public const FULL_POINTS = 3;

    public const PARTIAL_POINTS = 1;

    public static function totalSets(): int
    {
        return array_sum(array_map(
            fn (WorkoutExercise $exercise): int => $exercise->sets(),
            WorkoutExercise::cases(),
        ));
    }

    public static function pointsFor(int $setsDone): int
    {
        return match (true) {
            $setsDone <= 0 => 0,
            $setsDone >= self::totalSets() => self::FULL_POINTS,
            default => self::PARTIAL_POINTS,
        };
    }
}
