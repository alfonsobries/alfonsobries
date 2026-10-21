<?php

declare(strict_types=1);

namespace App\Availability;

use Carbon\CarbonImmutable;

/**
 * The mode the rules give at one instant, why, and when it next changes.
 */
final readonly class Evaluation
{
    public function __construct(
        public Mode $mode,
        public Reason $reason,
        public ?CarbonImmutable $nextTransitionAt = null,
        public ?Mode $nextMode = null,
    ) {}

    /**
     * @return array{mode: string, reason: string, next_transition: array{at: string, mode: string}|null}
     */
    public function toArray(string $timezone): array
    {
        return [
            'mode' => $this->mode->value,
            'reason' => $this->reason->value,
            'next_transition' => $this->nextTransitionAt === null || $this->nextMode === null ? null : [
                'at' => $this->nextTransitionAt->setTimezone($timezone)->toIso8601String(),
                'mode' => $this->nextMode->value,
            ],
        ];
    }
}
