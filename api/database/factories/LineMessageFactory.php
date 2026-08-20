<?php

namespace Database\Factories;

use App\Models\LineContact;
use App\Models\LineMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LineMessage>
 */
class LineMessageFactory extends Factory
{
    protected $model = LineMessage::class;

    public function definition(): array
    {
        return [
            'provider_id' => 'sms_'.$this->faker->unique()->lexify('????????????'),
            'line_contact_id' => LineContact::factory(),
            'direction' => LineMessage::DIRECTION_IN,
            'body' => $this->faker->sentence(),
            'segments' => 1,
            'status' => LineMessage::STATUS_RECEIVED,
            'provider_created_at' => now(),
        ];
    }

    public function outbound(): static
    {
        return $this->state(fn (array $attributes): array => [
            'direction' => LineMessage::DIRECTION_OUT,
            'status' => LineMessage::STATUS_SENT,
        ]);
    }
}
