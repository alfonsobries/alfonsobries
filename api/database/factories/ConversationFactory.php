<?php

namespace Database\Factories;

use App\Models\Assistant;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'assistant_id' => Assistant::factory(),
            'title' => $this->faker->sentence(3),
        ];
    }
}
