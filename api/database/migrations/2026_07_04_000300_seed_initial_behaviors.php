<?php

use App\Models\Behavior;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * The starting set of behaviors the kids are working on, with their
     * pre-generated illustrations shipped in the repo. One-time data
     * migration — from here on the parents manage behaviors from the app.
     */
    public function up(): void
    {
        // Tests build the exact data they need; skip so counts stay predictable.
        if (app()->environment('testing')) {
            return;
        }

        $behaviors = [
            'regina' => ['Pegar', 'Gritar', 'Malas palabras'],
            'andres' => ['No hacer caso', 'Berrinche', 'Manos en la boca'],
        ];

        foreach ($behaviors as $member => $names) {
            foreach ($names as $name) {
                $behavior = Behavior::withTrashed()->firstOrCreate(
                    ['family_member' => $member, 'name' => $name],
                    ['points' => 1],
                );

                if ($behavior->getFirstMedia('illustration') !== null) {
                    continue;
                }

                $file = resource_path(sprintf('illustrations/seed/%s-%s.png', $member, Str::slug($name)));

                if (file_exists($file)) {
                    $behavior
                        ->addMedia($file)
                        ->preservingOriginal()
                        ->toMediaCollection('illustration');
                }
            }
        }
    }

    public function down(): void
    {
        // Data migration; the behaviors stay.
    }
};
