<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Something to cash the first minutes in on, so the screen isn't empty
     * the day it ships.
     */
    public function up(): void
    {
        $now = now();

        DB::table('family_activities')->insert(array_map(
            fn (array $activity): array => $activity + ['created_at' => $now, 'updated_at' => $now],
            [
                ['name' => 'Armar Lego', 'cost_minutes' => 15],
                ['name' => 'Salir en bici', 'cost_minutes' => 30],
                ['name' => 'Juego de mesa', 'cost_minutes' => 30],
                ['name' => 'Ver una peli', 'cost_minutes' => 60],
                ['name' => 'Ir al parque', 'cost_minutes' => 60],
            ],
        ));
    }

    public function down(): void
    {
        DB::table('family_activities')->delete();
    }
};
