<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Http;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $techs = Project::TECHNOLOGIES;

        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->sentence(20),
            'url' => $this->faker->url(),
            'technologies' => $this->faker->randomElements($techs, $this->faker->numberBetween(1, count($techs))),
        ];
    }

    public function withBanner()
    {
        return $this->afterCreating(function (Project $project) {
            $url = sprintf('https://picsum.photos/seed/%s/%s/%s', $project->id, Project::BANNER_WIDTH * 2, Project::BANNER_HEIGHT * 2);
            $response = Http::get($url);
            $project->addMediaFromString($response->__toString())->toMediaCollection('banner');
        });
    }
}
