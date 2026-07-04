<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Laravel\Nova\Fields\Attachments\PruneStaleAttachments;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->call(function () {
            (new PruneStaleAttachments)();
        })->daily();

        // Deploys only fire from the real server — a local scheduler must
        // never trigger a Vercel build.
        $schedule->command('alfonsobries:deploy')->everyMinute()->environments(['production']);

        $schedule->command('alfonsobries:deploy --force')->dailyAt('00:00')->sundays()->environments(['production']);
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
