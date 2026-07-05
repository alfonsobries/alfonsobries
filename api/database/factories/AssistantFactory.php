<?php

namespace Database\Factories;

use App\Models\Assistant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Assistant>
 */
class AssistantFactory extends Factory
{
    protected $model = Assistant::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'slug' => Str::slug($name),
            'name' => Str::title($name),
            'emoji' => '🤖',
            'description' => $this->faker->sentence(),
            'instructions' => 'You are a helpful assistant.',
            'members' => User::MOOD_MEMBERS,
            'copyable_output' => false,
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
