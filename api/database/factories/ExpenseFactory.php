<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'paid_by' => 'alfonso',
            'expense_category_id' => ExpenseCategory::factory(),
            'amount' => $this->faker->randomFloat(2, 20, 2500),
            'currency' => Expense::DEFAULT_CURRENCY,
            'description' => $this->faker->randomElement(['Café en Starbucks', 'Súper en Soriana', 'Gasolina', 'Tacos al pastor', 'Farmacia del Ahorro']),
            'spent_at' => now()->subHours($this->faker->numberBetween(1, 48)),
            'source' => Expense::SOURCE_CHAT,
        ];
    }
}
