<?php

namespace Database\Factories;

use App\Models\HomeMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HomeMessage>
 */
class HomeMessageFactory extends Factory
{
    protected $model = HomeMessage::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'role' => HomeMessage::ROLE_USER,
            'content' => 'Gasté 50 en un café',
            'status' => HomeMessage::STATUS_COMPLETED,
            'source' => HomeMessage::SOURCE_APP,
        ];
    }

    public function assistant(): static
    {
        return $this->state(fn () => ['role' => HomeMessage::ROLE_ASSISTANT, 'content' => 'Listo ☕']);
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'role' => HomeMessage::ROLE_ASSISTANT,
            'content' => null,
            'status' => HomeMessage::STATUS_PENDING,
        ]);
    }
}
