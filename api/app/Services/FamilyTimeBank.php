<?php

namespace App\Services;

use App\Models\FamilyActivity;
use App\Models\FamilyTimeEntry;
use App\Models\PhoneReport;
use App\Models\User;

/**
 * The family's time bank. When the kids call dad out for being on his phone
 * and he agrees, the family is owed time together — one jar for everyone,
 * spent on something they do as a family.
 *
 * Minutes are never taken back on their own: they sit there until they are
 * cashed in.
 */
class FamilyTimeBank
{
    /**
     * What one confirmed report buys. Fixed on purpose — the kids can count on
     * it being the same every time.
     */
    public const MINUTES_PER_REPORT = 15;

    public function balance(): int
    {
        return (int) FamilyTimeEntry::sum('minutes');
    }

    public function credit(PhoneReport $report): FamilyTimeEntry
    {
        return FamilyTimeEntry::create([
            'minutes' => self::MINUTES_PER_REPORT,
            'source_type' => $report->getMorphClass(),
            'source_id' => $report->id,
            'created_by' => $report->reviewed_by,
        ]);
    }

    /**
     * The report stopped counting — its minutes go with it.
     */
    public function revoke(PhoneReport $report): void
    {
        FamilyTimeEntry::where('source_type', $report->getMorphClass())
            ->where('source_id', $report->id)
            ->delete();
    }

    public function spend(FamilyActivity $activity, ?User $author = null): FamilyTimeEntry
    {
        return FamilyTimeEntry::create([
            'minutes' => -$activity->cost_minutes,
            'source_type' => $activity->getMorphClass(),
            'source_id' => $activity->id,
            'created_by' => $author?->id,
        ]);
    }
}
