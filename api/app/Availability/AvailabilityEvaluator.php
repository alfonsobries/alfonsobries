<?php

declare(strict_types=1);

namespace App\Availability;

use Carbon\CarbonImmutable;

/**
 * Computes the support mode from the rules, with the precedence every brand
 * applies: an active override, then the active exception with the latest
 * start, then a weekly window (online), then the outside-hours mode.
 *
 * The next transition is found by evaluating every instant where some rule
 * starts or stops applying, in order, and keeping the first one whose mode
 * differs. Weekly boundaries are generated in the schedule's timezone, so a
 * daylight-saving change moves them with the wall clock.
 */
final class AvailabilityEvaluator
{
    /**
     * How far ahead weekly boundaries are generated. A week plus a day covers
     * every weekday's windows starting from any instant.
     */
    private const HORIZON_DAYS = 8;

    public function evaluate(AvailabilityRules $rules, CarbonImmutable $now): Evaluation
    {
        [$mode, $reason] = $this->modeAt($rules, $now);

        foreach ($this->boundariesAfter($rules, $now) as $boundary) {
            [$nextMode] = $this->modeAt($rules, $boundary);

            if ($nextMode !== $mode) {
                return new Evaluation($mode, $reason, $boundary, $nextMode);
            }
        }

        return new Evaluation($mode, $reason);
    }

    /**
     * @return array{Mode, Reason}
     */
    public function modeAt(AvailabilityRules $rules, CarbonImmutable $instant): array
    {
        if ($rules->override?->isActiveAt($instant)) {
            return [$rules->override->mode, Reason::Override];
        }

        $exception = $this->activeException($rules, $instant);

        if ($exception !== null) {
            return [$exception->mode, Reason::Exception];
        }

        if ($this->insideWindow($rules, $instant)) {
            return [Mode::Online, Reason::Window];
        }

        return [$rules->outsideHoursMode, Reason::OutsideHours];
    }

    private function activeException(AvailabilityRules $rules, CarbonImmutable $instant): ?AvailabilityException
    {
        $active = null;

        foreach ($rules->exceptions as $exception) {
            if ($exception->covers($instant) && ($active === null || $exception->startsAt->greaterThan($active->startsAt))) {
                $active = $exception;
            }
        }

        return $active;
    }

    private function insideWindow(AvailabilityRules $rules, CarbonImmutable $instant): bool
    {
        $local = $instant->setTimezone($rules->timezone);
        $weekday = $local->dayOfWeekIso;
        $minute = $local->hour * 60 + $local->minute;

        return array_any(
            $rules->weekly,
            fn (WeeklyWindow $window): bool => $window->coversDay($weekday)
                && $window->fromMinute() <= $minute
                && $minute < $window->toMinute(),
        );
    }

    /**
     * Every future instant where a rule starts or stops applying, ascending
     * and without duplicates.
     *
     * @return list<CarbonImmutable>
     */
    private function boundariesAfter(AvailabilityRules $rules, CarbonImmutable $now): array
    {
        $boundaries = [];

        if ($rules->override?->until !== null) {
            $boundaries[] = $rules->override->until;
        }

        foreach ($rules->exceptions as $exception) {
            $boundaries[] = $exception->startsAt;
            $boundaries[] = $exception->endsAt;
        }

        $today = $now->setTimezone($rules->timezone)->startOfDay();

        for ($offset = 0; $offset <= self::HORIZON_DAYS; $offset++) {
            $day = $today->addDays($offset);

            foreach ($rules->weekly as $window) {
                if (! $window->coversDay($day->dayOfWeekIso)) {
                    continue;
                }

                $boundaries[] = $this->wallClock($day, $window->from, $rules->timezone);
                $boundaries[] = $this->wallClock($day, $window->to, $rules->timezone);
            }
        }

        $future = [];

        foreach ($boundaries as $boundary) {
            if ($boundary->greaterThan($now)) {
                $future[$boundary->getTimestamp()] = $boundary;
            }
        }

        ksort($future);

        return array_values($future);
    }

    /**
     * The instant a wall-clock time falls on for a given local day. `24:00` is
     * the next midnight.
     */
    private function wallClock(CarbonImmutable $day, string $time, string $timezone): CarbonImmutable
    {
        if ($time === '24:00') {
            return CarbonImmutable::create($day->year, $day->month, $day->day, 0, 0, 0, $timezone)->addDay()->utc();
        }

        [$hours, $minutes] = array_map(intval(...), explode(':', $time, 2));

        return CarbonImmutable::create($day->year, $day->month, $day->day, $hours, $minutes, 0, $timezone)->utc();
    }
}
