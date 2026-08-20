<?php

namespace Database\Factories;

use App\Models\LineCall;
use App\Models\LineContact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LineCall>
 */
class LineCallFactory extends Factory
{
    protected $model = LineCall::class;

    public function definition(): array
    {
        return [
            'provider_id' => 'call_'.$this->faker->unique()->lexify('????????????'),
            'line_contact_id' => LineContact::factory(),
            'direction' => LineCall::DIRECTION_IN,
            'status' => LineCall::STATUS_COMPLETED,
            'started_at' => now()->subMinutes(5),
            'answered_at' => now()->subMinutes(5),
            'ended_at' => now()->subMinutes(4),
            'duration_sec' => 60,
        ];
    }

    public function missed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => LineCall::STATUS_MISSED,
            'answered_at' => null,
            'duration_sec' => 0,
        ]);
    }

    public function ringing(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => LineCall::STATUS_RINGING,
            'started_at' => now(),
            'answered_at' => null,
            'ended_at' => null,
            'duration_sec' => 0,
        ]);
    }
}
