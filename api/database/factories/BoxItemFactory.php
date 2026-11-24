<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Box;
use App\Models\BoxItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BoxItem>
 */
class BoxItemFactory extends Factory
{
    protected $model = BoxItem::class;

    public function definition(): array
    {
        return [
            'box_id' => Box::factory(),
            'name' => $this->faker->randomElement(['Esferas rojas', 'Luces de colores', 'Taladro', 'Mameluco', 'Lego Duplo']),
            'quantity' => $this->faker->numberBetween(1, 6),
            'notes' => null,
        ];
    }
}
