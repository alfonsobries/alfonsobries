<?php

namespace Database\Factories;

use App\Models\LineContact;
use App\Models\LineVoicemail;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LineVoicemail>
 */
class LineVoicemailFactory extends Factory
{
    protected $model = LineVoicemail::class;

    public function definition(): array
    {
        return [
            'provider_id' => 'vm_'.$this->faker->unique()->lexify('????????????'),
            'line_contact_id' => LineContact::factory(),
            'transcript' => $this->faker->sentence(10),
            'duration_sec' => $this->faker->numberBetween(5, 90),
            'received_at' => now(),
        ];
    }
}
