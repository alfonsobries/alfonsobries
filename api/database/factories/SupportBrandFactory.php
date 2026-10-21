<?php

namespace Database\Factories;

use App\Models\SupportBrand;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupportBrand>
 */
class SupportBrandFactory extends Factory
{
    protected $model = SupportBrand::class;

    public function definition(): array
    {
        $name = 'brand-'.$this->faker->unique()->lexify('??????');

        return [
            'name' => $name,
            'label' => ucfirst($name),
            'base_url' => "https://{$name}.test/api",
            'secret' => 'secret-'.$name,
            'enabled' => true,
        ];
    }

    public function disabled(): static
    {
        return $this->state(fn (): array => ['enabled' => false]);
    }
}
