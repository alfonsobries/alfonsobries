<?php

namespace Database\Factories;

use App\Models\ResumeExperience;
use Illuminate\Database\Eloquent\Factories\Factory;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ResumeExperience>
 */
class ResumeExperienceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'period' => $this->faker->sentence(2),
            'place' => $this->faker->word(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->sentence(20),
            'type' => $this->faker->randomElement([ResumeExperience::TYPE_WORK, ResumeExperience::TYPE_EDUCATION]),
        ];
    }
}
