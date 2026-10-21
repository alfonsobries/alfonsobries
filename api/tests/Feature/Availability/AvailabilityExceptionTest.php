<?php

use App\Models\SupportAvailability;
use App\Models\SupportAvailabilityException;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::preventStrayRequests();
    Http::fake(['*/support/availability' => Http::response(['status' => 'applied', 'version' => 1, 'mode' => 'online'])]);

    $this->travelTo(now()->parse('2026-10-20 10:00:00', 'America/Mexico_City'));
    SupportAvailability::factory()->create(['version' => 2]);
    $this->alfonso = User::factory()->create(['family_member' => 'alfonso']);
});

it('adds an exception and pushes it', function () {
    enableSupportBrands(['vexilo']);

    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.exceptions.store'), [
            'starts_at' => '2026-12-20T00:00',
            'ends_at' => '2027-01-04T00:00',
            'mode' => 'offline',
            'label' => '  Vacaciones  ',
        ])
        ->assertCreated()
        ->assertJsonPath('data.rules.version', 3)
        ->assertJsonPath('data.rules.exceptions.0.starts_at', '2026-12-20T00:00:00-06:00')
        ->assertJsonPath('data.rules.exceptions.0.ends_at', '2027-01-04T00:00:00-06:00')
        ->assertJsonPath('data.rules.exceptions.0.mode', 'offline')
        ->assertJsonPath('data.rules.exceptions.0.label', 'Vacaciones');

    $exception = SupportAvailabilityException::query()->sole();

    expect($exception->starts_at->toIso8601String())->toBe('2026-12-20T06:00:00+00:00');

    Http::assertSent(fn (Request $request): bool => $request->data()['exceptions'] === [[
        'starts_at' => '2026-12-20T00:00:00-06:00',
        'ends_at' => '2027-01-04T00:00:00-06:00',
        'mode' => 'offline',
        'label' => 'Vacaciones',
    ]] && availabilityPushIsSigned($request, 'secret-vexilo'));
});

it('lists exceptions in order with their ids and leaves out the ones that ended', function () {
    $later = SupportAvailabilityException::factory()->create(['starts_at' => now()->addDays(10), 'ends_at' => now()->addDays(12)]);
    $sooner = SupportAvailabilityException::factory()->create(['starts_at' => now()->addDay(), 'ends_at' => now()->addDays(2), 'label' => null]);
    SupportAvailabilityException::factory()->create(['starts_at' => now()->subDays(3), 'ends_at' => now()->subDay()]);

    $this->actingAs($this->alfonso)
        ->getJson(route('api.availability.show'))
        ->assertJsonCount(2, 'data.rules.exceptions')
        ->assertJsonPath('data.rules.exceptions.0.id', $sooner->id)
        ->assertJsonPath('data.rules.exceptions.0.label', null)
        ->assertJsonPath('data.rules.exceptions.1.id', $later->id);
});

it('shows an active exception as the current mode', function () {
    SupportAvailabilityException::factory()->create([
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addHours(2),
        'mode' => 'bot',
    ]);

    $this->actingAs($this->alfonso)
        ->getJson(route('api.availability.show'))
        ->assertJsonPath('data.status.mode', 'bot')
        ->assertJsonPath('data.status.reason', 'exception')
        ->assertJsonPath('data.status.next_transition', ['at' => '2026-10-20T12:00:00-06:00', 'mode' => 'online']);
});

it('edits an exception', function () {
    $exception = SupportAvailabilityException::factory()->create();

    $this->actingAs($this->alfonso)
        ->patchJson(route('api.availability.exceptions.update', $exception), [
            'starts_at' => '2026-11-02T00:00:00-06:00',
            'ends_at' => '2026-11-03T00:00:00-06:00',
            'mode' => 'bot',
            'label' => 'Dia de muertos',
        ])
        ->assertOk()
        ->assertJsonPath('data.rules.version', 3)
        ->assertJsonPath('data.rules.exceptions.0.id', $exception->id)
        ->assertJsonPath('data.rules.exceptions.0.mode', 'bot')
        ->assertJsonPath('data.rules.exceptions.0.label', 'Dia de muertos');
});

it('removes an exception', function () {
    $exception = SupportAvailabilityException::factory()->create();

    $this->actingAs($this->alfonso)
        ->deleteJson(route('api.availability.exceptions.destroy', $exception))
        ->assertOk()
        ->assertJsonPath('data.rules.version', 3)
        ->assertJsonPath('data.rules.exceptions', []);

    expect(SupportAvailabilityException::query()->count())->toBe(0);
});

it('rejects an invalid exception', function (array $input, string $field) {
    $this->actingAs($this->alfonso)
        ->postJson(route('api.availability.exceptions.store'), [
            'starts_at' => '2026-12-20T00:00',
            'ends_at' => '2026-12-21T00:00',
            'mode' => 'offline',
            ...$input,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);

    expect(SupportAvailability::current()->version)->toBe(2);
})->with([
    'end before start' => [['ends_at' => '2026-12-19T00:00'], 'ends_at'],
    'same instant' => [['ends_at' => '2026-12-20T00:00'], 'ends_at'],
    'already over' => [['starts_at' => '2026-10-01T00:00', 'ends_at' => '2026-10-02T00:00'], 'ends_at'],
    'unknown mode' => [['mode' => 'away'], 'mode'],
    'not a date' => [['starts_at' => 'pronto'], 'starts_at'],
    'long label' => [['label' => str_repeat('a', 61)], 'label'],
]);

it('is only for Alfonso', function () {
    $exception = SupportAvailabilityException::factory()->create();
    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)->deleteJson(route('api.availability.exceptions.destroy', $exception))->assertForbidden();
    $this->actingAs($saida)->postJson(route('api.availability.override.store'), ['mode' => 'bot'])->assertForbidden();

    expect(SupportAvailabilityException::query()->count())->toBe(1);
});
