<?php

namespace Database\Factories;

use App\Models\ResumeSkill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ResumeSkill>
 */
class ResumeSkillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'level' => $this->faker->randomElement([ResumeSkill::LEVEL_EXPERT, ResumeSkill::LEVEL_ADVANCED]),
            'name' => $this->faker->word(),
            'category' => $this->faker->randomElement([ResumeSkill::CATEGORY_FRAMEWORK, ResumeSkill::CATEGORY_LANGUAGE, ResumeSkill::CATEGORY_OTHER]),
        ];
    }
}
