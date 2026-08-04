<?php

namespace App\Observers;

use App\Models\ChoreLog;
use App\Services\KidPoints;

/**
 * Keeps the point ledger in step with the evening review, wherever the verdict
 * is changed from — the app, Nova, or a seeder.
 */
class ChoreLogObserver
{
    public function __construct(
        private readonly KidPoints $points,
    ) {}

    public function created(ChoreLog $log): void
    {
        if ($log->status === ChoreLog::STATUS_APPROVED) {
            $this->points->award($log);
        }
    }

    public function updated(ChoreLog $log): void
    {
        if (! $log->wasChanged('status')) {
            return;
        }

        $this->points->withdraw($log);

        if ($log->status === ChoreLog::STATUS_APPROVED) {
            $this->points->award($log);
        }
    }

    public function deleted(ChoreLog $log): void
    {
        $this->points->withdraw($log);
    }
}
