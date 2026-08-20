<?php

namespace Database\Factories;

use App\Models\LineContact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LineContact>
 */
class LineContactFactory extends Factory
{
    protected $model = LineContact::class;

    public function definition(): array
    {
        return [
            'e164' => '+5255'.$this->faker->unique()->numerify('########'),
            'name' => $this->faker->optional()->name(),
            'blocked' => false,
            'favorite' => false,
        ];
    }
}
