<?php

namespace Database\Factories;

use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExpenseCategory>
 */
class ExpenseCategoryFactory extends Factory
{
    protected $model = ExpenseCategory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst($this->faker->unique()->words(2, true)),
            'emoji' => $this->faker->randomElement(['🛒', '🍽️', '☕', '⛽', '🏠', '💊', '🧸', '👕']),
            'sort_order' => 0,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn () => ['archived_at' => now()]);
    }
}
