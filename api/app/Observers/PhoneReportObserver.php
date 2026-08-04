<?php

namespace App\Observers;

use App\Models\PhoneReport;
use App\Services\FamilyTimeBank;

/**
 * A report is worth its minutes the moment it is made.
 */
class PhoneReportObserver
{
    public function __construct(
        private readonly FamilyTimeBank $bank,
    ) {}

    public function created(PhoneReport $report): void
    {
        $this->bank->credit($report);
    }

    public function deleted(PhoneReport $report): void
    {
        $this->bank->revoke($report);
    }
}
