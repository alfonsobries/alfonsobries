<?php

namespace Database\Factories;

use App\Models\FavoriteIllustration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FavoriteIllustration>
 */
class FavoriteIllustrationFactory extends Factory
{
    protected $model = FavoriteIllustration::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'chat_message_id' => null,
            'prompt' => $this->faker->sentence(),
            'members' => ['regina'],
        ];
    }
}
