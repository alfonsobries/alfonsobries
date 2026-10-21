<?php

declare(strict_types=1);

namespace App\Availability;

/**
 * A recurring span on some weekdays during which Alfonso is online. Times are
 * wall-clock `HH:MM` in the schedule's timezone; `to` is exclusive and may be
 * `24:00`, so a window never crosses midnight.
 */
final readonly class WeeklyWindow
{
    /**
     * @param  list<int>  $days  ISO weekdays, 1 = Monday ... 7 = Sunday.
     */
    public function __construct(
        public array $days,
        public string $from,
        public string $to,
    ) {}

    /**
     * @param  array{days: list<int>, from: string, to: string}  $window
     */
    public static function fromArray(array $window): self
    {
        return new self(array_map(intval(...), $window['days']), $window['from'], $window['to']);
    }

    public function coversDay(int $isoWeekday): bool
    {
        return in_array($isoWeekday, $this->days, true);
    }

    public function fromMinute(): int
    {
        return self::minuteOfDay($this->from);
    }

    public function toMinute(): int
    {
        return self::minuteOfDay($this->to);
    }

    public static function minuteOfDay(string $time): int
    {
        [$hours, $minutes] = array_map(intval(...), explode(':', $time, 2));

        return $hours * 60 + $minutes;
    }

    /**
     * @return array{days: list<int>, from: string, to: string}
     */
    public function toArray(): array
    {
        return ['days' => $this->days, 'from' => $this->from, 'to' => $this->to];
    }
}
