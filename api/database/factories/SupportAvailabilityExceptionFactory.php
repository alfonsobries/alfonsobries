<?php

namespace Database\Factories;

use App\Availability\Mode;
use App\Models\SupportAvailabilityException;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupportAvailabilityException>
 */
class SupportAvailabilityExceptionFactory extends Factory
{
    protected $model = SupportAvailabilityException::class;

    public function definition(): array
    {
        $startsAt = now()->addWeek()->startOfDay();

        return [
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addDays(5),
            'mode' => Mode::Offline,
            'label' => 'Vacaciones',
        ];
    }
}
