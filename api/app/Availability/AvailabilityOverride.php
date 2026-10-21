<?php

declare(strict_types=1);

namespace App\Availability;

use Carbon\CarbonImmutable;

/**
 * A manual "right now" mode that beats every other rule until it expires, or
 * until it is removed when `until` is null.
 */
final readonly class AvailabilityOverride
{
    public function __construct(
        public Mode $mode,
        public ?CarbonImmutable $until = null,
    ) {}

    public function isActiveAt(CarbonImmutable $instant): bool
    {
        return $this->until === null || $instant->lessThan($this->until);
    }
}
