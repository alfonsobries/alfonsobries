<?php

use App\Models\Chore;
use App\Models\Reward;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * The starting daily chores and the first reward each kid saves for,
     * with their pre-generated illustrations shipped in the repo. One-time
     * data migration — from here on the parents manage them from the app.
     */
    public function up(): void
    {
        // Tests build the exact data they need; skip so counts stay predictable.
        if (app()->environment('testing')) {
            return;
        }

        $chores = [
            'regina' => [
                ['Compartir', 'regina-compartir'],
                ['Comer bien', 'regina-comer-bien'],
                ['Ser amable', 'regina-ser-amable'],
                ['Lavarse los dientes', 'regina-lavarse-los-dientes'],
            ],
            'andres' => [
                ['Comer bien', 'andres-comer-bien'],
                ['Ser ordenado', 'andres-ser-ordenado'],
                ['Lavarse los dientes', 'andres-lavarse-los-dientes'],
                ['Jugar en armonía', 'andres-jugar-en-armonia'],
            ],
        ];

        foreach ($chores as $member => $rows) {
            foreach ($rows as [$name, $slug]) {
                $chore = Chore::withTrashed()->firstOrCreate(
                    ['family_member' => $member, 'name' => $name],
                    ['points' => 1],
                );

                $this->attachIllustration($chore, $slug);
            }
        }

        $rewards = [
            ['regina', 'Un postre', 15, 'regina-un-postre'],
            ['andres', 'Un postre', 15, 'andres-un-postre'],
        ];

        foreach ($rewards as [$member, $name, $cost, $slug]) {
            $reward = Reward::withTrashed()->firstOrCreate(
                ['family_member' => $member, 'name' => $name],
                ['cost' => $cost],
            );

            $this->attachIllustration($reward, $slug);
        }
    }

    public function down(): void
    {
        // Data migration; the chores and rewards stay.
    }

    private function attachIllustration(Chore|Reward $model, string $slug): void
    {
        if ($model->getFirstMedia('illustration') !== null) {
            return;
        }

        $file = resource_path("illustrations/seed/{$slug}.png");

        if (file_exists($file)) {
            $model
                ->addMedia($file)
                ->preservingOriginal()
                ->toMediaCollection('illustration');
        }
    }
};
