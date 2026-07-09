<?php

namespace Database\Factories;

use App\Models\VirtueDay;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VirtueDay>
 */
class VirtueDayFactory extends Factory
{
    protected $model = VirtueDay::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'date' => fake()->unique()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'prayers_completed_at' => null,
            'resolution' => null,
        ];
    }
}
