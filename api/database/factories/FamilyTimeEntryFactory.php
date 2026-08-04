<?php

namespace Database\Factories;

use App\Models\FamilyTimeEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FamilyTimeEntry>
 */
class FamilyTimeEntryFactory extends Factory
{
    protected $model = FamilyTimeEntry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'minutes' => 15,
            'reason' => null,
            'source_type' => null,
            'source_id' => null,
            'created_by' => null,
        ];
    }
}
