<?php

namespace App\Workout;

/**
 * The fixed daily routine, one case per exercise. The set is the unit of
 * progress — one tap each — so an exercise is described by how many sets it
 * asks for and how big one set is in its own unit.
 */
enum WorkoutExercise: string
{
    case PullUps = 'pull_ups';

    case PushUps = 'push_ups';

    case AirSquats = 'air_squats';

    case DeepSquat = 'deep_squat';

    /** Sets the routine asks for. */
    public function sets(): int
    {
        return match ($this) {
            self::PullUps, self::PushUps, self::AirSquats => 3,
            self::DeepSquat => 5,
        };
    }

    /** The size of one set, in this exercise's unit. */
    public function target(): int
    {
        return match ($this) {
            self::PullUps => 10,
            self::PushUps => 30,
            self::AirSquats => 20,
            self::DeepSquat => 60,
        };
    }

    /** A hold is measured in seconds; everything else in repetitions. */
    public function unit(): string
    {
        return match ($this) {
            self::DeepSquat => 'seconds',
            default => 'reps',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * The routine as the app renders it, so the numbers live in one place.
     *
     * @return list<array{key: string, sets: int, target: int, unit: string}>
     */
    public static function plan(): array
    {
        return array_map(fn (self $exercise): array => [
            'key' => $exercise->value,
            'sets' => $exercise->sets(),
            'target' => $exercise->target(),
            'unit' => $exercise->unit(),
        ], self::cases());
    }
}
