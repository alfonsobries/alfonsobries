<?php

namespace App\Observers;

use App\Models\PhoneReport;
use App\Services\FamilyTimeBank;

/**
 * Keeps the time bank in step with dad's answer, wherever it is given from.
 */
class PhoneReportObserver
{
    public function __construct(
        private readonly FamilyTimeBank $bank,
    ) {}

    public function created(PhoneReport $report): void
    {
        if ($report->status === PhoneReport::STATUS_CONFIRMED) {
            $this->bank->credit($report);
        }
    }

    public function updated(PhoneReport $report): void
    {
        if (! $report->wasChanged('status')) {
            return;
        }

        $this->bank->revoke($report);

        if ($report->status === PhoneReport::STATUS_CONFIRMED) {
            $this->bank->credit($report);
        }
    }

    public function deleted(PhoneReport $report): void
    {
        $this->bank->revoke($report);
    }
}
