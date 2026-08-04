<?php

namespace App\Services;

use App\Models\ChoreLog;
use App\Models\PointEntry;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * A kid's chore-points economy, kept as a ledger. Approved chores add points,
 * redeemed rewards spend them, and a parent can hand out or take back points
 * by hand.
 *
 * Every entry names the goal its points sit in, so each reward carries its own
 * jar instead of the whole family of rewards sharing one number. Points land
 * in the kid's active goal; with no goal set they wait in the free jar and
 * move across the moment one is chosen.
 */
class KidPoints
{
    /**
     * Everything the kid holds, across every jar.
     */
    public function balanceFor(string $member): int
    {
        return (int) PointEntry::where('family_member', $member)->sum('delta');
    }

    /**
     * Points not yet handed to a goal.
     */
    public function freeFor(string $member): int
    {
        return (int) PointEntry::where('family_member', $member)
            ->whereNull('reward_id')
            ->sum('delta');
    }

    /**
     * What this goal alone has saved up.
     */
    public function savedFor(Reward $reward): int
    {
        return (int) PointEntry::where('reward_id', $reward->id)->sum('delta');
    }

    /**
     * The goal the kid is saving into right now.
     */
    public function activeGoal(string $member): ?Reward
    {
        return Reward::where('family_member', $member)
            ->where('is_active', true)
            ->pending()
            ->first();
    }

    /**
     * A parent approved a chore.
     */
    public function award(ChoreLog $log): PointEntry
    {
        return PointEntry::create([
            'family_member' => $log->family_member,
            'delta' => $log->points,
            'reward_id' => $this->activeGoal($log->family_member)?->id,
            'source_type' => $log->getMorphClass(),
            'source_id' => $log->id,
        ]);
    }

    /**
     * The approval was taken back — the points go with it.
     */
    public function withdraw(ChoreLog $log): void
    {
        PointEntry::where('source_type', $log->getMorphClass())
            ->where('source_id', $log->id)
            ->delete();
    }

    /**
     * A parent hands out or takes back points by hand, always with a reason
     * the kid can be told.
     */
    public function adjust(string $member, int $delta, string $reason, ?User $author = null): PointEntry
    {
        return PointEntry::create([
            'family_member' => $member,
            'delta' => $delta,
            'reason' => $reason,
            'reward_id' => $this->activeGoal($member)?->id,
            'created_by' => $author?->id,
        ]);
    }

    /**
     * Point the kid's saving at this goal. Whatever waits in the free jar
     * moves in with it.
     */
    public function activate(Reward $reward): void
    {
        DB::transaction(function () use ($reward): void {
            Reward::where('family_member', $reward->family_member)
                ->whereKeyNot($reward->getKey())
                ->update(['is_active' => false]);

            $reward->update(['is_active' => true]);

            $this->moveFreeInto($reward);
        });
    }

    /**
     * Cash a goal in: its cost leaves the ledger, anything left over returns
     * to the free jar, and the next pending goal takes over.
     */
    public function spend(Reward $reward): void
    {
        DB::transaction(function () use ($reward): void {
            PointEntry::create([
                'family_member' => $reward->family_member,
                'delta' => -$reward->cost,
                'reward_id' => $reward->id,
                'source_type' => $reward->getMorphClass(),
                'source_id' => $reward->id,
            ]);

            $this->release($reward);

            $reward->update(['is_active' => false]);

            $this->promoteNextGoal($reward->family_member);
        });
    }

    /**
     * Make sure the kid is saving into something, as long as they have a
     * pending goal to save into.
     */
    public function promoteNextGoal(string $member): ?Reward
    {
        if ($goal = $this->activeGoal($member)) {
            return $goal;
        }

        $next = Reward::where('family_member', $member)
            ->pending()
            ->orderBy('id')
            ->first();

        if ($next !== null) {
            $this->activate($next);
        }

        return $next;
    }

    /**
     * Empty a goal's jar back into the free one — when it is cashed in, or
     * when it goes away.
     */
    public function release(Reward $reward): void
    {
        $this->move($reward->family_member, $this->savedFor($reward), $reward->id, null);
    }

    private function moveFreeInto(Reward $reward): void
    {
        $this->move($reward->family_member, $this->freeFor($reward->family_member), null, $reward->id);
    }

    private function move(string $member, int $amount, ?int $from, ?int $to): void
    {
        if ($amount === 0) {
            return;
        }

        foreach ([[-$amount, $from], [$amount, $to]] as [$delta, $reward]) {
            PointEntry::create([
                'family_member' => $member,
                'delta' => $delta,
                'reason' => PointEntry::REASON_CARRY_OVER,
                'reward_id' => $reward,
            ]);
        }
    }
}
