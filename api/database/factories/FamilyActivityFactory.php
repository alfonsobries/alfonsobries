<?php

namespace Database\Factories;

use App\Models\FamilyActivity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FamilyActivity>
 */
class FamilyActivityFactory extends Factory
{
    protected $model = FamilyActivity::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Salir en bici', 'Juego de mesa', 'Ir al parque']),
            'cost_minutes' => 30,
        ];
    }
}
