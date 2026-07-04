<?php

namespace Database\Factories;

use App\Models\Behavior;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Behavior>
 */
class BehaviorFactory extends Factory
{
    protected $model = Behavior::class;

    public function definition(): array
    {
        return [
            'family_member' => $this->faker->randomElement(User::KID_MEMBERS),
            'name' => $this->faker->words(2, true),
            'points' => 1,
        ];
    }
}
