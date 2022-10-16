<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DeployFrontend extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alfonsobries:deploy {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Triggers a vercel deployment of the frontend';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        if (Cache::has(config('site.expireCacheKey')) || $this->option('force')) {
            $this->info('Deploying frontend...');

            Http::post(config('services.vercel.deployment_url'));

            Cache::forget(config('site.expireCacheKey'));

            return 0;
        }

        $this->info('Frontend is up to date');

        return 0;
    }
}
