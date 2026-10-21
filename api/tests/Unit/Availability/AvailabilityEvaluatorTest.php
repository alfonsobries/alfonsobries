<?php

use App\Availability\AvailabilityEvaluator;
use App\Availability\AvailabilityRules;
use App\Availability\Evaluation;
use App\Availability\Mode;
use App\Availability\Reason;
use Carbon\CarbonImmutable;

/**
 * @param  array<string, mixed>  $overrides
 */
function availabilityRules(array $overrides = []): AvailabilityRules
{
    return AvailabilityRules::fromArray([
        'version' => 1,
        'timezone' => 'America/Mexico_City',
        'weekly' => [
            ['days' => [1, 2, 3, 4, 5], 'from' => '07:00', 'to' => '20:00'],
            ['days' => [6], 'from' => '09:00', 'to' => '13:00'],
        ],
        'outside_hours_mode' => 'bot',
        'exceptions' => [],
        'override' => null,
        ...$overrides,
    ]);
}

function evaluateAt(AvailabilityRules $rules, string $instant): Evaluation
{
    return (new AvailabilityEvaluator)->evaluate($rules, CarbonImmutable::parse($instant));
}

it('is online inside a weekly window', function () {
    // Tuesday 2026-10-20, 10:00 in Mexico City.
    $evaluation = evaluateAt(availabilityRules(), '2026-10-20T10:00:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Online)
        ->and($evaluation->reason)->toBe(Reason::Window)
        ->and($evaluation->nextTransitionAt?->toIso8601String())->toBe('2026-10-21T02:00:00+00:00')
        ->and($evaluation->nextMode)->toBe(Mode::Bot);
});

it('uses the outside hours mode outside every window', function () {
    $evaluation = evaluateAt(availabilityRules(['outside_hours_mode' => 'offline']), '2026-10-20T21:30:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Offline)
        ->and($evaluation->reason)->toBe(Reason::OutsideHours)
        ->and($evaluation->nextTransitionAt?->setTimezone('America/Mexico_City')->format('Y-m-d H:i'))->toBe('2026-10-21 07:00')
        ->and($evaluation->nextMode)->toBe(Mode::Online);
});

it('treats the end of a window as exclusive and its start as inclusive', function () {
    $rules = availabilityRules();

    expect(evaluateAt($rules, '2026-10-20T07:00:00-06:00')->mode)->toBe(Mode::Online)
        ->and(evaluateAt($rules, '2026-10-20T19:59:59-06:00')->mode)->toBe(Mode::Online)
        ->and(evaluateAt($rules, '2026-10-20T20:00:00-06:00')->mode)->toBe(Mode::Bot)
        ->and(evaluateAt($rules, '2026-10-20T06:59:59-06:00')->mode)->toBe(Mode::Bot);
});

it('reads Sunday as day 7', function () {
    $rules = availabilityRules(['weekly' => [['days' => [7], 'from' => '10:00', 'to' => '12:00']]]);

    // 2026-10-25 is a Sunday, 2026-10-19 a Monday.
    expect(evaluateAt($rules, '2026-10-25T11:00:00-06:00')->mode)->toBe(Mode::Online)
        ->and(evaluateAt($rules, '2026-10-19T11:00:00-06:00')->mode)->toBe(Mode::Bot);
});

it('runs a window ending at 24:00 until midnight', function () {
    $rules = availabilityRules(['weekly' => [['days' => [2], 'from' => '18:00', 'to' => '24:00']]]);

    $evaluation = evaluateAt($rules, '2026-10-20T23:59:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Online)
        ->and($evaluation->nextTransitionAt?->setTimezone('America/Mexico_City')->format('Y-m-d H:i'))->toBe('2026-10-21 00:00')
        ->and(evaluateAt($rules, '2026-10-21T00:00:00-06:00')->mode)->toBe(Mode::Bot);
});

it('skips a midnight boundary between two windows that touch', function () {
    $rules = availabilityRules(['weekly' => [
        ['days' => [2], 'from' => '18:00', 'to' => '24:00'],
        ['days' => [3], 'from' => '00:00', 'to' => '02:00'],
    ]]);

    $evaluation = evaluateAt($rules, '2026-10-20T22:00:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Online)
        ->and($evaluation->nextTransitionAt?->setTimezone('America/Mexico_City')->format('Y-m-d H:i'))->toBe('2026-10-21 02:00');
});

it('merges overlapping windows on the same day', function () {
    $rules = availabilityRules(['weekly' => [
        ['days' => [2], 'from' => '09:00', 'to' => '14:00'],
        ['days' => [2], 'from' => '12:00', 'to' => '18:00'],
    ]]);

    expect(evaluateAt($rules, '2026-10-20T10:00:00-06:00')->nextTransitionAt?->setTimezone('America/Mexico_City')->format('H:i'))->toBe('18:00');
});

it('lets an active exception beat the weekly schedule', function () {
    $rules = availabilityRules(['exceptions' => [[
        'starts_at' => '2026-12-20T00:00:00-06:00',
        'ends_at' => '2027-01-04T00:00:00-06:00',
        'mode' => 'offline',
        'label' => 'Vacaciones',
    ]]]);

    $evaluation = evaluateAt($rules, '2026-12-22T10:00:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Offline)
        ->and($evaluation->reason)->toBe(Reason::Exception)
        ->and($evaluation->nextTransitionAt?->utc()->toIso8601String())->toBe('2027-01-04T06:00:00+00:00')
        ->and($evaluation->nextMode)->toBe(Mode::Bot);
});

it('treats an exception as half-open', function () {
    $rules = availabilityRules(['exceptions' => [[
        'starts_at' => '2026-10-20T10:00:00-06:00',
        'ends_at' => '2026-10-20T12:00:00-06:00',
        'mode' => 'offline',
        'label' => null,
    ]]]);

    expect(evaluateAt($rules, '2026-10-20T10:00:00-06:00')->mode)->toBe(Mode::Offline)
        ->and(evaluateAt($rules, '2026-10-20T12:00:00-06:00')->mode)->toBe(Mode::Online);
});

it('picks the overlapping exception that started last', function () {
    $rules = availabilityRules(['exceptions' => [
        ['starts_at' => '2026-12-20T00:00:00-06:00', 'ends_at' => '2027-01-04T00:00:00-06:00', 'mode' => 'offline', 'label' => 'Vacaciones'],
        ['starts_at' => '2026-12-24T09:00:00-06:00', 'ends_at' => '2026-12-24T11:00:00-06:00', 'mode' => 'online', 'label' => 'Guardia'],
    ]]);

    $during = evaluateAt($rules, '2026-12-24T10:00:00-06:00');

    expect($during->mode)->toBe(Mode::Online)
        ->and($during->reason)->toBe(Reason::Exception)
        ->and($during->nextTransitionAt?->setTimezone('America/Mexico_City')->format('Y-m-d H:i'))->toBe('2026-12-24 11:00')
        ->and($during->nextMode)->toBe(Mode::Offline);

    $before = evaluateAt($rules, '2026-12-23T10:00:00-06:00');

    expect($before->mode)->toBe(Mode::Offline)
        ->and($before->nextTransitionAt?->setTimezone('America/Mexico_City')->format('Y-m-d H:i'))->toBe('2026-12-24 09:00')
        ->and($before->nextMode)->toBe(Mode::Online);
});

it('lets an active override beat everything', function () {
    $rules = availabilityRules([
        'override' => ['mode' => 'bot', 'until' => '2026-12-24T22:00:00-06:00'],
        'exceptions' => [['starts_at' => '2026-12-20T00:00:00-06:00', 'ends_at' => '2027-01-04T00:00:00-06:00', 'mode' => 'offline', 'label' => null]],
    ]);

    $evaluation = evaluateAt($rules, '2026-12-24T10:00:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Bot)
        ->and($evaluation->reason)->toBe(Reason::Override)
        ->and($evaluation->nextTransitionAt?->setTimezone('America/Mexico_City')->format('Y-m-d H:i'))->toBe('2026-12-24 22:00')
        ->and($evaluation->nextMode)->toBe(Mode::Offline);
});

it('ignores an expired override', function () {
    $rules = availabilityRules(['override' => ['mode' => 'offline', 'until' => '2026-10-20T09:00:00-06:00']]);

    $evaluation = evaluateAt($rules, '2026-10-20T10:00:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Online)
        ->and($evaluation->reason)->toBe(Reason::Window)
        ->and($rules->toArray(CarbonImmutable::parse('2026-10-20T10:00:00-06:00'))['override'])->toBeNull();
});

it('keeps an override without an end until it is removed', function () {
    $rules = availabilityRules(['override' => ['mode' => 'offline', 'until' => null]]);

    $evaluation = evaluateAt($rules, '2026-10-20T10:00:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Offline)
        ->and($evaluation->reason)->toBe(Reason::Override)
        ->and($evaluation->nextTransitionAt)->toBeNull();
});

it('skips an override end that does not change the mode', function () {
    $rules = availabilityRules(['override' => ['mode' => 'online', 'until' => '2026-10-20T11:00:00-06:00']]);

    $evaluation = evaluateAt($rules, '2026-10-20T10:00:00-06:00');

    expect($evaluation->nextTransitionAt?->setTimezone('America/Mexico_City')->format('H:i'))->toBe('20:00');
});

it('has no next transition when the mode never changes', function () {
    $rules = availabilityRules(['weekly' => []]);

    $evaluation = evaluateAt($rules, '2026-10-20T10:00:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Bot)
        ->and($evaluation->nextTransitionAt)->toBeNull()
        ->and($evaluation->toArray('America/Mexico_City')['next_transition'])->toBeNull();
});

it('finds the next transition across a weekend', function () {
    // Saturday 2026-10-24 14:00, after the Saturday window.
    $evaluation = evaluateAt(availabilityRules(), '2026-10-24T14:00:00-06:00');

    expect($evaluation->mode)->toBe(Mode::Bot)
        ->and($evaluation->nextTransitionAt?->setTimezone('America/Mexico_City')->format('Y-m-d H:i'))->toBe('2026-10-26 07:00');
});

it('follows the wall clock across a daylight saving change', function () {
    $rules = availabilityRules([
        'timezone' => 'America/New_York',
        'weekly' => [['days' => [1, 2, 3, 4, 5, 6, 7], 'from' => '09:00', 'to' => '17:00']],
    ]);

    // New York falls back on Sunday 2026-11-01 at 02:00 (EDT -04:00 to EST -05:00).
    $before = evaluateAt($rules, '2026-10-31T18:00:00-04:00');

    expect($before->nextTransitionAt?->toIso8601String())->toBe('2026-11-01T14:00:00+00:00');

    // 09:00 EST is 14:00 UTC; 09:00 EDT the day before was 13:00 UTC.
    expect(evaluateAt($rules, '2026-11-01T13:30:00+00:00')->mode)->toBe(Mode::Bot)
        ->and(evaluateAt($rules, '2026-11-01T14:00:00+00:00')->mode)->toBe(Mode::Online)
        ->and(evaluateAt($rules, '2026-10-31T13:30:00+00:00')->mode)->toBe(Mode::Online);
});

it('follows the wall clock when the clocks spring forward', function () {
    $rules = availabilityRules([
        'timezone' => 'Europe/Madrid',
        'weekly' => [['days' => [7], 'from' => '01:00', 'to' => '04:00']],
    ]);

    // Madrid springs forward on Sunday 2027-03-28 at 02:00 (+01:00 to +02:00): the window lasts two real hours.
    $evaluation = evaluateAt($rules, '2027-03-28T01:30:00+01:00');

    expect($evaluation->mode)->toBe(Mode::Online)
        ->and($evaluation->nextTransitionAt?->toIso8601String())->toBe('2027-03-28T02:00:00+00:00');
});

it('keeps Mexico City on a fixed offset all year', function () {
    $rules = availabilityRules(['weekly' => [['days' => [1, 2, 3, 4, 5, 6, 7], 'from' => '09:00', 'to' => '18:00']]]);

    expect(evaluateAt($rules, '2026-04-06T15:00:00+00:00')->mode)->toBe(Mode::Online)
        ->and(evaluateAt($rules, '2026-11-06T15:00:00+00:00')->mode)->toBe(Mode::Online)
        ->and(evaluateAt($rules, '2026-04-06T14:59:00+00:00')->mode)->toBe(Mode::Bot);
});

it('serializes the contract shape', function () {
    $rules = availabilityRules([
        'version' => 42,
        'updated_at' => '2026-10-21T18:52:00Z',
        'exceptions' => [['starts_at' => '2026-12-20T06:00:00Z', 'ends_at' => '2027-01-04T06:00:00Z', 'mode' => 'offline', 'label' => 'Vacaciones']],
        'override' => ['mode' => 'bot', 'until' => '2026-10-22T04:00:00Z'],
    ]);

    expect($rules->toArray(CarbonImmutable::parse('2026-10-21T18:52:00Z')))->toBe([
        'version' => 42,
        'updated_at' => '2026-10-21T18:52:00Z',
        'timezone' => 'America/Mexico_City',
        'weekly' => [
            ['days' => [1, 2, 3, 4, 5], 'from' => '07:00', 'to' => '20:00'],
            ['days' => [6], 'from' => '09:00', 'to' => '13:00'],
        ],
        'outside_hours_mode' => 'bot',
        'exceptions' => [
            ['starts_at' => '2026-12-20T00:00:00-06:00', 'ends_at' => '2027-01-04T00:00:00-06:00', 'mode' => 'offline', 'label' => 'Vacaciones'],
        ],
        'override' => ['mode' => 'bot', 'until' => '2026-10-21T22:00:00-06:00'],
    ]);
});
