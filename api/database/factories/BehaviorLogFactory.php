<?php

namespace Database\Factories;

use App\Models\Behavior;
use App\Models\BehaviorLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BehaviorLog>
 */
class BehaviorLogFactory extends Factory
{
    protected $model = BehaviorLog::class;

    public function definition(): array
    {
        return [
            'behavior_id' => Behavior::factory(),
            'family_member' => fn (array $attributes) => Behavior::find($attributes['behavior_id'])->family_member ?? User::KID_MEMBERS[0],
            'user_id' => User::factory(),
            'points' => 1,
            'affected_mood' => false,
            'mood_emoji' => null,
        ];
    }
}
