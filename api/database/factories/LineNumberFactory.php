<?php

namespace Database\Factories;

use App\Models\LineNumber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LineNumber>
 */
class LineNumberFactory extends Factory
{
    protected $model = LineNumber::class;

    public function definition(): array
    {
        return [
            'provider_id' => 'num_'.$this->faker->unique()->lexify('????????????'),
            'e164' => '+5255'.$this->faker->numerify('########'),
            'display' => null,
            'status' => 'active',
            'billing_period' => 'monthly',
            'renews_at' => now()->addMonth(),
            'auto_renew' => true,
            'ai_enabled' => false,
            'synced_at' => now(),
        ];
    }
}
