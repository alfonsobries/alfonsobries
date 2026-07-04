<?php

namespace Database\Factories;

use App\Models\Reward;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reward>
 */
class RewardFactory extends Factory
{
    protected $model = Reward::class;

    public function definition(): array
    {
        return [
            'family_member' => $this->faker->randomElement(User::KID_MEMBERS),
            'name' => $this->faker->words(2, true),
            'cost' => 10,
            'available_on' => null,
            // Tests opt into the mood gate explicitly.
            'requires_content_parents' => false,
            'achieved_at' => null,
        ];
    }

    public function achieved(): static
    {
        return $this->state(fn (): array => [
            'achieved_at' => now(),
        ]);
    }
}
