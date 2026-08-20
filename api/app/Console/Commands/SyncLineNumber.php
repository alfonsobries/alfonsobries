<?php

namespace App\Console\Commands;

use App\Models\LineNumber;
use App\Notifications\LineAlertNotification;
use App\Services\Line\LineSync;
use Illuminate\Console\Command;

class SyncLineNumber extends Command
{
    protected $signature = 'line:sync-number';

    protected $description = 'Refresh the private-line number mirror (status, renewal, AI config, usage)';

    public function handle(LineSync $sync): int
    {
        $number = $sync->syncNumber();

        if ($number === null) {
            return self::SUCCESS;
        }

        $this->warnAboutRenewal($sync, $number);

        return self::SUCCESS;
    }

    /**
     * Losing the number breaks every account verified with it, so a renewal
     * that isn't going to happen on its own gets flagged a week ahead.
     */
    private function warnAboutRenewal(LineSync $sync, LineNumber $number): void
    {
        if ($number->auto_renew || $number->renews_at === null) {
            return;
        }

        if (! $number->renews_at->isBetween(now(), now()->addWeek())) {
            return;
        }

        $sync->notifyAlfonso(new LineAlertNotification(
            'Private line renewal at risk',
            'The number expires '.$number->renews_at->diffForHumans().' and auto-renew is off.',
        ));
    }
}
