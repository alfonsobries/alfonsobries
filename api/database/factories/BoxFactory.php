<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Box;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Box>
 */
class BoxFactory extends Factory
{
    protected $model = Box::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Navidad', 'Ropa de bebé', 'Herramientas', 'Juguetes viejos', 'Papeles']),
            'emoji' => $this->faker->randomElement(['📦', '🎄', '🧸', '🧰', '👶']),
            'location' => $this->faker->randomElement(['Bodega', 'Closet de visitas', 'Cochera', null]),
        ];
    }
}
