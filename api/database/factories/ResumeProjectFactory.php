<?php

namespace Database\Factories;

use App\Models\ResumeProject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResumeProject>
 */
class ResumeProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'title' => $this->faker->sentence(2),
            'description' => $this->faker->sentence(20),
            'url' => $this->faker->url(),
        ];
    }
}
