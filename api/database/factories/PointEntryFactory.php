<?php

namespace Database\Factories;

use App\Models\PointEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PointEntry>
 */
class PointEntryFactory extends Factory
{
    protected $model = PointEntry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'family_member' => $this->faker->randomElement(User::KID_MEMBERS),
            'delta' => 5,
            'reason' => null,
            'reward_id' => null,
            'source_type' => null,
            'source_id' => null,
            'created_by' => null,
        ];
    }
}
