<?php

namespace App\Console\Commands;

use App\Services\BehaviorIllustrator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class Illustrate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'illustrate
        {description : What to draw}
        {--member= : Who stars in the scene (regina, andres, saida or alfonso); omit for an object-only illustration}
        {--out= : Output file path; defaults to storage/app/illustrations}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate an illustration in the family style guides (docs/illustrations.md)';

    private const MEMBERS = ['regina', 'andres', 'saida', 'alfonso'];

    public function handle(BehaviorIllustrator $illustrator): int
    {
        $member = $this->option('member') ?: null;

        if ($member !== null && ! in_array($member, self::MEMBERS, true)) {
            $this->error('Unknown member. Use one of: '.implode(', ', self::MEMBERS).' — or omit it.');

            return 1;
        }

        $description = (string) $this->argument('description');

        $target = $this->option('out') ?: storage_path(sprintf(
            'app/illustrations/%s-%s.png',
            now()->format('Y-m-d-His'),
            Str::limit(Str::slug($description), 40, ''),
        ));

        $this->info('Generating… (usually 30-90s)');

        $contents = $illustrator->illustrate($member, $description);

        File::ensureDirectoryExists(dirname($target));
        File::put($target, $contents);

        $this->info("Saved to {$target}");

        return 0;
    }
}
