<?php

namespace Database\Factories;

use App\Models\ChatMessage;
use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatMessage>
 */
class ChatMessageFactory extends Factory
{
    protected $model = ChatMessage::class;

    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'role' => ChatMessage::ROLE_USER,
            'content' => $this->faker->sentence(),
            'status' => ChatMessage::STATUS_COMPLETED,
        ];
    }

    public function assistant(): static
    {
        return $this->state(fn () => ['role' => ChatMessage::ROLE_ASSISTANT]);
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'role' => ChatMessage::ROLE_ASSISTANT,
            'content' => null,
            'status' => ChatMessage::STATUS_PENDING,
        ]);
    }
}
