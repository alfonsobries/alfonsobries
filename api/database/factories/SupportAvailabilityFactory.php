<?php

namespace Database\Factories;

use App\Availability\Mode;
use App\Models\SupportAvailability;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupportAvailability>
 */
class SupportAvailabilityFactory extends Factory
{
    protected $model = SupportAvailability::class;

    public function definition(): array
    {
        return [
            'timezone' => 'America/Mexico_City',
            'weekly' => [
                ['days' => [1, 2, 3, 4, 5], 'from' => '07:00', 'to' => '20:00'],
                ['days' => [6], 'from' => '09:00', 'to' => '13:00'],
            ],
            'outside_hours_mode' => Mode::Bot,
            'version' => 1,
        ];
    }
}
