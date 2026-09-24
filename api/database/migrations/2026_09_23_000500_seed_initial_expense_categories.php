<?php

use App\Models\ExpenseCategory;
use App\Models\PaymentAccount;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * The starting categories and the one account every household has. From
     * here on both are managed from the app.
     */
    public function up(): void
    {
        // Tests build the exact data they need; skip so counts stay predictable.
        if (app()->environment('testing')) {
            return;
        }

        $categories = [
            ['🛒', 'Súper'],
            ['🍽️', 'Restaurantes'],
            ['☕', 'Café y antojos'],
            ['🚗', 'Transporte'],
            ['⛽', 'Gasolina'],
            ['🏠', 'Casa'],
            ['💡', 'Servicios'],
            ['💊', 'Salud'],
            ['🧸', 'Niños'],
            ['🎒', 'Escuela'],
            ['👕', 'Ropa'],
            ['💈', 'Cuidado personal'],
            ['🎬', 'Entretenimiento'],
            ['📺', 'Suscripciones'],
            ['✈️', 'Viajes'],
            ['🎁', 'Regalos'],
            ['⛪', 'Donativos'],
            ['📦', 'Otros'],
        ];

        foreach ($categories as $index => [$emoji, $name]) {
            ExpenseCategory::firstOrCreate(['name' => $name], [
                'emoji' => $emoji,
                'sort_order' => $index,
            ]);
        }

        PaymentAccount::firstOrCreate(['name' => 'Efectivo'], [
            'emoji' => '💵',
            'kind' => PaymentAccount::KIND_CASH,
            'owner' => null,
            'sort_order' => 0,
        ]);
    }

    public function down(): void
    {
        //
    }
};
