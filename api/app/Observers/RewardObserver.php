<?php

namespace App\Observers;

use App\Models\Reward;
use App\Services\KidPoints;

/**
 * Keeps a kid pointed at something to save into: a first goal takes over on
 * its own, and a goal that goes away hands its points back before the next
 * one steps in.
 */
class RewardObserver
{
    public function __construct(
        private readonly KidPoints $points,
    ) {}

    public function created(Reward $reward): void
    {
        $this->points->promoteNextGoal($reward->family_member);
    }

    public function deleted(Reward $reward): void
    {
        $this->points->release($reward);
        $this->points->promoteNextGoal($reward->family_member);
    }
}
