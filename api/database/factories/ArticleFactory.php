<?php

namespace Database\Factories;

use Carbon\Carbon;
use DavidBadura\FakerMarkdownGenerator\FakerProvider;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $this->faker->addProvider(new FakerProvider($this->faker));

        return [
            'title' => $this->faker->sentence(),
            'body' => $this->faker->markdown(),
            'excerpt' => $this->faker->sentence(12),
            'published_at' => Carbon::now(),
        ];
    }
}
