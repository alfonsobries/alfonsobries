<?php

namespace App\Console\Commands;

use App\Models\FamilyActivity;
use App\Services\BehaviorIllustrator;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class IllustrateFamilyActivities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'family:illustrate-activities
        {--force : Redraw the ones that already have art}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Draw the family time activities so the kids can pick one without reading';

    public function handle(BehaviorIllustrator $illustrator): int
    {
        $activities = FamilyActivity::orderBy('id')->get()
            ->filter(fn (FamilyActivity $activity): bool => $this->option('force') || $activity->imageUrl() === null);

        if ($activities->isEmpty()) {
            $this->info('Every activity already has art.');

            return 0;
        }

        foreach ($activities as $activity) {
            $this->info("Drawing “{$activity->name}”… (usually 30-90s)");

            $bytes = $illustrator->illustrate(null, $this->subjectFor($activity));

            $activity->clearMediaCollection('illustration');
            $activity
                ->addMediaFromString($bytes)
                ->usingFileName(Str::slug($activity->name).'.png')
                ->toMediaCollection('illustration');
        }

        $this->info("Drew {$activities->count()} activit".($activities->count() === 1 ? 'y' : 'ies').'.');

        return 0;
    }

    private function subjectFor(FamilyActivity $activity): string
    {
        return sprintf(
            'the family activity "%s". One clear, cheerful object or prop that stands for it, centred and instantly '
            .'recognizable to a 4-6 year old who cannot read yet.',
            trim($activity->name),
        );
    }
}
