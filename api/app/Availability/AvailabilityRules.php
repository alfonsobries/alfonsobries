<?php

declare(strict_types=1);

namespace App\Availability;

use Carbon\CarbonImmutable;

/**
 * The full availability rules as every brand receives them. Brands evaluate
 * the current mode from these rules on their own, so the serialized shape is
 * a shared contract: keep `toArray()` exactly as documented.
 *
 * @phpstan-type WindowArray array{days: list<int>, from: string, to: string}
 * @phpstan-type ExceptionArray array{starts_at: string, ends_at: string, mode: string, label: string|null}
 * @phpstan-type RulesArray array{version: int, updated_at: string|null, timezone: string, weekly: list<WindowArray>, outside_hours_mode: string, exceptions: list<ExceptionArray>, override: array{mode: string, until: string|null}|null}
 */
final readonly class AvailabilityRules
{
    /**
     * @param  list<WeeklyWindow>  $weekly
     * @param  list<AvailabilityException>  $exceptions
     */
    public function __construct(
        public int $version,
        public string $timezone,
        public array $weekly,
        public Mode $outsideHoursMode,
        public array $exceptions = [],
        public ?AvailabilityOverride $override = null,
        public ?CarbonImmutable $updatedAt = null,
    ) {}

    /**
     * @param  array{version: int, timezone: string, weekly: list<WindowArray>, outside_hours_mode: string, exceptions?: list<ExceptionArray>, override?: array{mode: string, until?: string|null}|null, updated_at?: string|null}  $rules
     */
    public static function fromArray(array $rules): self
    {
        $override = $rules['override'] ?? null;

        return new self(
            version: (int) $rules['version'],
            timezone: $rules['timezone'],
            weekly: array_map(WeeklyWindow::fromArray(...), $rules['weekly']),
            outsideHoursMode: Mode::from($rules['outside_hours_mode']),
            exceptions: array_map(AvailabilityException::fromArray(...), $rules['exceptions'] ?? []),
            override: $override === null ? null : new AvailabilityOverride(
                Mode::from($override['mode']),
                isset($override['until']) ? CarbonImmutable::parse($override['until']) : null,
            ),
            updatedAt: isset($rules['updated_at']) ? CarbonImmutable::parse($rules['updated_at']) : null,
        );
    }

    /**
     * The contract payload. Timestamps carry the schedule's offset so they
     * read as wall-clock time; `updated_at` is UTC. An override that already
     * expired is sent as null: brands ignore it either way.
     *
     * @return RulesArray
     */
    public function toArray(?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();
        $override = $this->override?->isActiveAt($now) ? $this->override : null;

        return [
            'version' => $this->version,
            'updated_at' => $this->updatedAt?->utc()->format('Y-m-d\TH:i:s\Z'),
            'timezone' => $this->timezone,
            'weekly' => array_map(fn (WeeklyWindow $window): array => $window->toArray(), $this->weekly),
            'outside_hours_mode' => $this->outsideHoursMode->value,
            'exceptions' => array_map(fn (AvailabilityException $exception): array => [
                'starts_at' => $this->localIso($exception->startsAt),
                'ends_at' => $this->localIso($exception->endsAt),
                'mode' => $exception->mode->value,
                'label' => $exception->label,
            ], $this->exceptions),
            'override' => $override === null ? null : [
                'mode' => $override->mode->value,
                'until' => $override->until === null ? null : $this->localIso($override->until),
            ],
        ];
    }

    public function localIso(CarbonImmutable $instant): string
    {
        return $instant->setTimezone($this->timezone)->toIso8601String();
    }
}
