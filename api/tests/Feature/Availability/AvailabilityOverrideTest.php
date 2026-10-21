<?php

use App\Availability\Mode;
use App\Models\SupportAvailability;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::preventStrayRequests();
    Http::fake(['*/support/availability' => Http::response(['status' => 'applied', 'version' => 1, 'mode' => 'bot'])]);

    // Tuesday 2026-10-20, 10:00 in Mexico City, inside the 07:00-20:00 window.
    $this->travelTo(now()->parse('2026-10-20 10:00:00', 'America/Mexico_City'));
    SupportAvailability::factory()->create(['version' => 5]);
    $this->alfonso = User::factory()->create(['family_member' => 'alfonso']);
});

it('sets a mode for some hours', function () {
    enableSupportBrands(['zebrasnap']);

    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.override.store'), ['mode' => 'bot', 'hours' => 3])
        ->assertOk()
        ->assertJsonPath('data.rules.version', 6)
        ->assertJsonPath('data.rules.override', ['mode' => 'bot', 'until' => '2026-10-20T13:00:00-06:00'])
        ->assertJsonPath('data.status.mode', 'bot')
        ->assertJsonPath('data.status.reason', 'override')
        ->assertJsonPath('data.status.next_transition', ['at' => '2026-10-20T13:00:00-06:00', 'mode' => 'online']);

    Http::assertSent(fn (Request $request): bool => $request->data()['override'] === ['mode' => 'bot', 'until' => '2026-10-20T13:00:00-06:00']
        && availabilityPushIsSigned($request, 'secret-zebrasnap'));
});

it('sets a mode until a given time, read in the schedule timezone', function () {
    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.override.store'), ['mode' => 'offline', 'until' => '2026-10-20T16:30'])
        ->assertOk()
        ->assertJsonPath('data.rules.override.until', '2026-10-20T16:30:00-06:00');

    // One hour from now in Mexico City, still in the past in UTC.
    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.override.store'), ['mode' => 'offline', 'until' => '2026-10-20T11:00'])
        ->assertOk()
        ->assertJsonPath('data.rules.override.until', '2026-10-20T11:00:00-06:00');

    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.override.store'), ['mode' => 'offline', 'until' => '2026-10-20T23:00:00Z'])
        ->assertOk()
        ->assertJsonPath('data.rules.override.until', '2026-10-20T17:00:00-06:00');
});

it('sets a mode until tomorrow\'s first window', function () {
    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.override.store'), ['mode' => 'offline', 'tomorrow' => true])
        ->assertOk()
        ->assertJsonPath('data.rules.override.until', '2026-10-21T07:00:00-06:00');
});

it('falls back to nine in the morning when tomorrow has no window', function () {
    // Friday night: Saturday's window opens at 09:00, Sunday has none.
    $this->travelTo(now()->parse('2026-10-24 22:00:00', 'America/Mexico_City'));

    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.override.store'), ['mode' => 'offline', 'tomorrow' => true])
        ->assertJsonPath('data.rules.override.until', '2026-10-25T09:00:00-06:00');
});

it('sets a mode until it is removed, and removes it', function () {
    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.override.store'), ['mode' => 'offline'])
        ->assertOk()
        ->assertJsonPath('data.rules.override', ['mode' => 'offline', 'until' => null])
        ->assertJsonPath('data.status.next_transition', null);

    $this->actingAs($this->alfonso)
        ->deleteJson(route('api.availability.override.destroy'))
        ->assertOk()
        ->assertJsonPath('data.rules.version', 7)
        ->assertJsonPath('data.rules.override', null)
        ->assertJsonPath('data.status.mode', 'online')
        ->assertJsonPath('data.status.reason', 'window');

    expect(SupportAvailability::current()->override_mode)->toBeNull();
});

it('reports an override that expired as gone', function () {
    $this->actingAs($this->alfonso)->postJson(route('api.availability.override.store'), ['mode' => Mode::Offline->value, 'hours' => 1]);

    $this->travel(61)->minutes();

    $this->actingAs($this->alfonso)
        ->getJson(route('api.availability.show'))
        ->assertJsonPath('data.rules.override', null)
        ->assertJsonPath('data.status.reason', 'window');
});

it('rejects an invalid override', function (array $input, string $field) {
    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.override.store'), $input)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);

    expect(SupportAvailability::current()->version)->toBe(5);
})->with([
    'no mode' => [['hours' => 1], 'mode'],
    'unknown mode' => [['mode' => 'away'], 'mode'],
    'zero hours' => [['mode' => 'bot', 'hours' => 0], 'hours'],
    'over a week' => [['mode' => 'bot', 'hours' => 169], 'hours'],
    'past time' => [['mode' => 'bot', 'until' => '2026-10-20T09:00'], 'until'],
    'past instant' => [['mode' => 'bot', 'until' => '2026-10-20T15:00:00Z'], 'until'],
    'not a date' => [['mode' => 'bot', 'until' => 'luego'], 'until'],
    'hours and until' => [['mode' => 'bot', 'hours' => 1, 'until' => '2026-10-21T09:00'], 'hours'],
    'hours and tomorrow' => [['mode' => 'bot', 'hours' => 1, 'tomorrow' => true], 'hours'],
]);
