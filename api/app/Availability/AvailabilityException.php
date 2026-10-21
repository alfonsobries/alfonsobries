<?php

declare(strict_types=1);

namespace App\Availability;

use Carbon\CarbonImmutable;

/**
 * A dated span with its own mode (a vacation, a day off, an event). The span
 * is half-open: `[starts_at, ends_at)`.
 */
final readonly class AvailabilityException
{
    public function __construct(
        public CarbonImmutable $startsAt,
        public CarbonImmutable $endsAt,
        public Mode $mode,
        public ?string $label = null,
        public ?int $id = null,
    ) {}

    /**
     * @param  array{starts_at: string, ends_at: string, mode: string, label?: string|null}  $exception
     */
    public static function fromArray(array $exception): self
    {
        return new self(
            CarbonImmutable::parse($exception['starts_at']),
            CarbonImmutable::parse($exception['ends_at']),
            Mode::from($exception['mode']),
            $exception['label'] ?? null,
        );
    }

    public function covers(CarbonImmutable $instant): bool
    {
        return $this->startsAt->lessThanOrEqualTo($instant) && $instant->lessThan($this->endsAt);
    }
}
