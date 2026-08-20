<?php

namespace App\Console\Commands;

use Database\Seeders\LineDemoSeeder;
use Illuminate\Console\Command;

class SeedLineDemo extends Command
{
    protected $signature = 'line:demo';

    protected $description = 'Fill the private line with fake threads so the app can be walked through without a provider key';

    public function handle(): int
    {
        $this->call('db:seed', ['--class' => LineDemoSeeder::class, '--no-interaction' => true]);
        $this->info('Demo line ready. Open the app as Alfonso — no provider key needed to browse.');

        return self::SUCCESS;
    }
}
