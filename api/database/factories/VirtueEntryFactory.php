<?php

namespace Database\Factories;

use App\Models\VirtueEntry;
use App\Virtue\VirtueHabit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VirtueEntry>
 */
class VirtueEntryFactory extends Factory
{
    protected $model = VirtueEntry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'date' => fake()->unique()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'habit' => fake()->randomElement(VirtueHabit::cases()),
            'completed_at' => now(),
        ];
    }
}
