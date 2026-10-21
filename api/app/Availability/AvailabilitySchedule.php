<?php

declare(strict_types=1);

namespace App\Availability;

use App\Jobs\PushAvailabilityToBrand;
use App\Models\SupportAvailability;
use App\Models\SupportBrand;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Reads and changes Alfonso's support availability. Every change bumps the
 * version inside a row lock and then pushes the new rules to each enabled
 * brand, so brands always converge on the latest version.
 */
final class AvailabilitySchedule
{
    /**
     * The hour "until tomorrow" lands on when tomorrow has no window.
     */
    private const TOMORROW_FALLBACK = '09:00';

    public function __construct(private readonly AvailabilityEvaluator $evaluator) {}

    public function rules(?CarbonImmutable $now = null): AvailabilityRules
    {
        return SupportAvailability::current()->toRules($now);
    }

    public function evaluate(?CarbonImmutable $now = null): Evaluation
    {
        $now ??= CarbonImmutable::now();

        return $this->evaluator->evaluate($this->rules($now), $now);
    }

    /**
     * Applies a change to the record and to anything else it touches (the
     * exceptions), bumps the version, and pushes the result to every brand.
     *
     * @param  callable(SupportAvailability): void  $change
     */
    public function change(callable $change): SupportAvailability
    {
        $availability = DB::transaction(function () use ($change): SupportAvailability {
            $id = SupportAvailability::current()->id;
            $record = SupportAvailability::query()->lockForUpdate()->findOrFail($id);

            $change($record);

            $record->version = $record->version + 1;
            $record->save();

            return $record;
        });

        $this->pushToBrands();

        return $availability;
    }

    public function pushToBrands(?SupportBrand $only = null): int
    {
        $brands = $only === null
            ? SupportBrand::query()->where('enabled', true)->orderBy('id')->get()
            : collect([$only]);

        $dispatched = 0;

        foreach ($brands as $brand) {
            if (! $brand->enabled || ! $brand->isConfigured()) {
                continue;
            }

            PushAvailabilityToBrand::dispatch($brand);
            $dispatched++;
        }

        return $dispatched;
    }

    /**
     * Groups windows with the same hours into one entry per span, so the
     * stored schedule reads like the contract's example however it was sent.
     *
     * @param  list<array{days: list<int>, from: string, to: string}>  $windows
     * @return list<array{days: list<int>, from: string, to: string}>
     */
    public static function normalizeWeekly(array $windows): array
    {
        $groups = [];

        foreach ($windows as $window) {
            $key = "{$window['from']}-{$window['to']}";
            $groups[$key] ??= ['days' => [], 'from' => $window['from'], 'to' => $window['to']];

            foreach ($window['days'] as $day) {
                $groups[$key]['days'][] = (int) $day;
            }
        }

        $normalized = array_map(function (array $group): array {
            $days = array_values(array_unique($group['days']));
            sort($days);

            return ['days' => $days, 'from' => $group['from'], 'to' => $group['to']];
        }, array_values($groups));

        usort($normalized, fn (array $a, array $b): int => [$a['days'][0], $a['from']] <=> [$b['days'][0], $b['from']]);

        return $normalized;
    }

    /**
     * "Until tomorrow": when tomorrow's first window opens, so an override
     * set tonight hands back to the schedule in the morning.
     */
    public function tomorrowMorning(?CarbonImmutable $now = null): CarbonImmutable
    {
        $rules = $this->rules($now);
        $tomorrow = ($now ?? CarbonImmutable::now())->setTimezone($rules->timezone)->addDay()->startOfDay();

        $starts = array_map(
            fn (WeeklyWindow $window): string => $window->from,
            array_values(array_filter($rules->weekly, fn (WeeklyWindow $window): bool => $window->coversDay($tomorrow->dayOfWeekIso))),
        );
        sort($starts);

        [$hours, $minutes] = array_map(intval(...), explode(':', $starts[0] ?? self::TOMORROW_FALLBACK, 2));

        return $tomorrow->setTime($hours, $minutes)->utc();
    }

    /**
     * Everything the app shows: the rules (exceptions with their ids), the
     * evaluated mode, and how each brand took the last push.
     *
     * @return array<string, mixed>
     */
    public function toApiPayload(?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();
        $record = SupportAvailability::current();
        $rules = $record->toRules($now);
        $payload = $rules->toArray($now);

        $payload['exceptions'] = array_map(
            fn (array $exception, AvailabilityException $source): array => ['id' => $source->id, ...$exception],
            $payload['exceptions'],
            $rules->exceptions,
        );

        return [
            'rules' => $payload,
            'status' => $this->evaluator->evaluate($rules, $now)->toArray($rules->timezone),
            'shared' => $rules->version > 0,
            'brands' => SupportBrand::query()
                ->orderBy('id')
                ->get()
                ->map(fn (SupportBrand $brand): array => $brand->toApiPayload())
                ->all(),
        ];
    }
}
