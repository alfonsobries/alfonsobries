<?php

namespace Database\Factories;

use App\Models\Chore;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chore>
 */
class ChoreFactory extends Factory
{
    protected $model = Chore::class;

    public function definition(): array
    {
        return [
            'family_member' => $this->faker->randomElement(User::KID_MEMBERS),
            'name' => $this->faker->words(2, true),
            'points' => 1,
        ];
    }
}
