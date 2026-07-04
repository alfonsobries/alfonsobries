<?php

namespace App\Services;

use App\Models\ChoreLog;
use App\Models\Reward;

/**
 * A kid's chore-points economy: approved chores earn points, achieved
 * rewards spend them.
 */
class KidPoints
{
    public function balanceFor(string $member): int
    {
        $earned = ChoreLog::where('family_member', $member)
            ->where('status', ChoreLog::STATUS_APPROVED)
            ->sum('points');

        $spent = Reward::withTrashed()
            ->where('family_member', $member)
            ->whereNotNull('achieved_at')
            ->sum('cost');

        return max(0, (int) $earned - (int) $spent);
    }
}
