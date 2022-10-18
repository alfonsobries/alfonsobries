<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class ExpireResume extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alfonsobries:expire-resume';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expires the resume cache';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        Cache::set(config('site.expireResumeKey'), true);

        return Command::SUCCESS;
    }
}
