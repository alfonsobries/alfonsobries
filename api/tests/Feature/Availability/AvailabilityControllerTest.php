<?php

use App\Models\SupportAvailability;
use App\Models\SupportBrand;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::preventStrayRequests();
    Http::fake(['*/support/availability' => Http::response(['status' => 'applied', 'version' => 1, 'mode' => 'online'])]);

    // Tuesday 2026-10-20, 10:00 in Mexico City.
    $this->travelTo(now()->parse('2026-10-20 10:00:00', 'America/Mexico_City'));
    $this->alfonso = User::factory()->create(['family_member' => 'alfonso']);
});

/**
 * @return array<string, mixed>
 */
function scheduleInput(array $overrides = []): array
{
    return [
        'timezone' => 'America/Mexico_City',
        'outside_hours_mode' => 'bot',
        'weekly' => [
            ['days' => [1], 'from' => '07:00', 'to' => '20:00'],
            ['days' => [5, 2, 3, 4], 'from' => '07:00', 'to' => '20:00'],
            ['days' => [6], 'from' => '09:00', 'to' => '13:00'],
        ],
        ...$overrides,
    ];
}

it('is only for Alfonso', function () {
    $this->getJson(route('api.availability.show'))->assertUnauthorized();

    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)
        ->getJson(route('api.availability.show'))
        ->assertForbidden();

    $this->actingAs($saida)
        ->putJson(route('api.availability.update'), scheduleInput())
        ->assertForbidden();
});

it('starts from an unshared office-hours default', function () {
    $this->actingAs($this->alfonso)
        ->getJson(route('api.availability.show'))
        ->assertOk()
        ->assertJsonPath('data.shared', false)
        ->assertJsonPath('data.rules.version', 0)
        ->assertJsonPath('data.rules.timezone', 'America/Mexico_City')
        ->assertJsonPath('data.rules.weekly', [['days' => [1, 2, 3, 4, 5], 'from' => '09:00', 'to' => '18:00']])
        ->assertJsonPath('data.rules.outside_hours_mode', 'bot')
        ->assertJsonPath('data.status.mode', 'online')
        ->assertJsonPath('data.status.reason', 'window')
        ->assertJsonPath('data.status.next_transition.at', '2026-10-20T18:00:00-06:00')
        ->assertJsonPath('data.status.next_transition.mode', 'bot')
        ->assertJsonCount(3, 'data.brands')
        ->assertJsonPath('data.brands.0.name', 'zebrasnap')
        ->assertJsonPath('data.brands.0.configured', false)
        ->assertJsonMissingPath('data.brands.0.secret')
        ->assertJsonPath('data.brands.0.last_push_error', null);

    Http::assertNothingSent();
});

it('saves the weekly schedule, bumps the version and pushes it signed to every brand', function () {
    enableSupportBrands();

    $this->actingAs($this->alfonso)
        ->putJson(route('api.availability.update'), scheduleInput(['outside_hours_mode' => 'offline']))
        ->assertOk()
        ->assertJsonPath('data.shared', true)
        ->assertJsonPath('data.rules.version', 1)
        ->assertJsonPath('data.rules.weekly', [
            ['days' => [1, 2, 3, 4, 5], 'from' => '07:00', 'to' => '20:00'],
            ['days' => [6], 'from' => '09:00', 'to' => '13:00'],
        ])
        ->assertJsonPath('data.rules.outside_hours_mode', 'offline')
        ->assertJsonPath('data.status.next_transition.at', '2026-10-20T20:00:00-06:00')
        ->assertJsonPath('data.status.next_transition.mode', 'offline')
        ->assertJsonPath('data.brands.0.last_push_status', 'applied')
        ->assertJsonPath('data.brands.0.reported_mode', 'online');

    Http::assertSentCount(3);

    foreach (['zebrasnap', 'kondable', 'vexilo'] as $name) {
        Http::assertSent(fn (Request $request): bool => $request->url() === "https://{$name}.test/api/support/availability"
            && $request->method() === 'POST'
            && $request->header('X-Availability-Timestamp')[0] === (string) now()->getTimestamp()
            && availabilityPushIsSigned($request, "secret-{$name}")
            && $request->data() === [
                'version' => 1,
                'updated_at' => '2026-10-20T16:00:00Z',
                'timezone' => 'America/Mexico_City',
                'weekly' => [
                    ['days' => [1, 2, 3, 4, 5], 'from' => '07:00', 'to' => '20:00'],
                    ['days' => [6], 'from' => '09:00', 'to' => '13:00'],
                ],
                'outside_hours_mode' => 'offline',
                'exceptions' => [],
                'override' => null,
            ]);
    }

    expect(SupportBrand::query()->where('name', 'kondable')->value('last_pushed_version'))->toBe(1);
});

it('increases the version on every change', function () {
    enableSupportBrands(['zebrasnap']);

    $this->actingAs($this->alfonso)->putJson(route('api.availability.update'), scheduleInput())->assertJsonPath('data.rules.version', 1);
    $this->actingAs($this->alfonso)->putJson(route('api.availability.update'), scheduleInput())->assertJsonPath('data.rules.version', 2);
    $this->actingAs($this->alfonso)->postJson(route('api.availability.override.store'), ['mode' => 'bot', 'hours' => 1])->assertJsonPath('data.rules.version', 3);

    $versions = collect(Http::recorded())->map(fn (array $pair): int => $pair[0]->data()['version'])->all();

    expect($versions)->toBe([1, 2, 3]);
});

it('skips brands that are disabled or not configured', function () {
    enableSupportBrands(['zebrasnap', 'vexilo']);
    SupportBrand::query()->where('name', 'vexilo')->update(['enabled' => false]);

    $this->actingAs($this->alfonso)->putJson(route('api.availability.update'), scheduleInput())->assertOk();

    Http::assertSentCount(1);
    Http::assertSent(fn (Request $request): bool => str_starts_with($request->url(), 'https://zebrasnap.test'));
});

it('accepts a window that ends at midnight and an empty schedule', function () {
    $this->actingAs($this->alfonso)
        ->putJson(route('api.availability.update'), scheduleInput(['weekly' => [['days' => [7], 'from' => '18:00', 'to' => '24:00']]]))
        ->assertOk()
        ->assertJsonPath('data.rules.weekly.0.to', '24:00');

    $this->actingAs($this->alfonso)
        ->putJson(route('api.availability.update'), scheduleInput(['weekly' => []]))
        ->assertOk()
        ->assertJsonPath('data.rules.weekly', [])
        ->assertJsonPath('data.status.mode', 'bot')
        ->assertJsonPath('data.status.reason', 'outside_hours');
});

it('rejects an invalid schedule', function (array $input, string $field) {
    $this->actingAs($this->alfonso)
        ->putJson(route('api.availability.update'), scheduleInput($input))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);

    expect(SupportAvailability::current()->version)->toBe(0);
})->with([
    'end before start' => [['weekly' => [['days' => [1], 'from' => '18:00', 'to' => '09:00']]], 'weekly.0.to'],
    'empty window' => [['weekly' => [['days' => [1], 'from' => '09:00', 'to' => '09:00']]], 'weekly.0.to'],
    'start at 24:00' => [['weekly' => [['days' => [1], 'from' => '24:00', 'to' => '24:00']]], 'weekly.0.from'],
    'past midnight' => [['weekly' => [['days' => [1], 'from' => '09:00', 'to' => '24:30']]], 'weekly.0.to'],
    'day 0' => [['weekly' => [['days' => [0], 'from' => '09:00', 'to' => '10:00']]], 'weekly.0.days.0'],
    'day 8' => [['weekly' => [['days' => [8], 'from' => '09:00', 'to' => '10:00']]], 'weekly.0.days.0'],
    'repeated day' => [['weekly' => [['days' => [1, 1], 'from' => '09:00', 'to' => '10:00']]], 'weekly.0.days.0'],
    'no days' => [['weekly' => [['days' => [], 'from' => '09:00', 'to' => '10:00']]], 'weekly.0.days'],
    'online outside hours' => [['outside_hours_mode' => 'online'], 'outside_hours_mode'],
    'unknown timezone' => [['timezone' => 'Mars/Olympus'], 'timezone'],
    'missing weekly' => [['weekly' => null], 'weekly'],
]);

it('pushes again on demand', function () {
    enableSupportBrands();
    SupportAvailability::current()->update(['version' => 4]);

    $this->actingAs($this->alfonso)->postJson(route('api.availability.resync'))->assertOk();
    Http::assertSentCount(3);

    $this->actingAs($this->alfonso)->postJson(route('api.availability.resync'), ['brand' => 'kondable'])->assertOk();
    Http::assertSentCount(4);
    Http::assertSent(fn (Request $request): bool => $request->data()['version'] === 4);

    expect(SupportAvailability::current()->version)->toBe(4);
});

it('does not push a schedule that was never saved', function () {
    enableSupportBrands();

    $this->actingAs($this->alfonso)->postJson(route('api.availability.resync'))->assertOk();

    Http::assertNothingSent();
});

it('rejects a resync for an unknown or disabled brand', function () {
    enableSupportBrands(['zebrasnap']);

    $this->actingAs($this->alfonso)->postJson(route('api.availability.resync'), ['brand' => 'acme'])->assertJsonValidationErrors('brand');
    $this->actingAs($this->alfonso)->postJson(route('api.availability.resync'), ['brand' => 'vexilo'])->assertJsonValidationErrors('brand');
});
