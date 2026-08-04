<?php

namespace Database\Factories;

use App\Models\PhoneReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PhoneReport>
 */
class PhoneReportFactory extends Factory
{
    protected $model = PhoneReport::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'family_member' => $this->faker->randomElement(User::KID_MEMBERS),
            'date' => now()->toDateString(),
            'status' => PhoneReport::STATUS_PENDING,
            'reviewed_by' => null,
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (): array => [
            'status' => PhoneReport::STATUS_CONFIRMED,
            'reviewed_by' => User::factory(),
        ]);
    }
}
