<?php

namespace Database\Factories;

use App\Models\WorkoutEntry;
use App\Workout\WorkoutExercise;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkoutEntry>
 */
class WorkoutEntryFactory extends Factory
{
    protected $model = WorkoutEntry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $exercise = fake()->randomElement(WorkoutExercise::cases());

        return [
            'date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'exercise' => $exercise,
            'sets' => fake()->numberBetween(1, $exercise->sets()),
            'completed_at' => now(),
        ];
    }
}
