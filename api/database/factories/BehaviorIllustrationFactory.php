<?php

namespace Database\Factories;

use App\Models\BehaviorIllustration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BehaviorIllustration>
 */
class BehaviorIllustrationFactory extends Factory
{
    protected $model = BehaviorIllustration::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->words(2, true),
            'status' => BehaviorIllustration::STATUS_PENDING,
            'path' => null,
            'error' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'status' => BehaviorIllustration::STATUS_COMPLETED,
            'path' => 'temp/behavior-illustrations/'.$this->faker->uuid().'.png',
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (): array => [
            'status' => BehaviorIllustration::STATUS_FAILED,
            'error' => 'Generation failed.',
        ]);
    }
}
