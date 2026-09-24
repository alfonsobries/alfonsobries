<?php

namespace Database\Factories;

use App\Models\PaymentAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentAccount>
 */
class PaymentAccountFactory extends Factory
{
    protected $model = PaymentAccount::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Amex', 'BBVA débito', 'Nu', 'Santander']),
            'emoji' => '💳',
            'kind' => PaymentAccount::KIND_CREDIT_CARD,
            'last4' => (string) $this->faker->numberBetween(1000, 9999),
            'owner' => 'alfonso',
            'sort_order' => 0,
        ];
    }
}
