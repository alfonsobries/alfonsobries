<?php

namespace Database\Factories;

use App\Models\Chore;
use App\Models\ChoreLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChoreLog>
 */
class ChoreLogFactory extends Factory
{
    protected $model = ChoreLog::class;

    public function definition(): array
    {
        return [
            'chore_id' => Chore::factory(),
            'family_member' => fn (array $attributes) => Chore::find($attributes['chore_id'])->family_member ?? User::KID_MEMBERS[0],
            'date' => now()->toDateString(),
            'status' => ChoreLog::STATUS_DONE,
            'reviewed_by' => null,
            'points' => 1,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (): array => [
            'status' => ChoreLog::STATUS_APPROVED,
            'reviewed_by' => User::factory(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (): array => [
            'status' => ChoreLog::STATUS_REJECTED,
            'reviewed_by' => User::factory(),
        ]);
    }
}
