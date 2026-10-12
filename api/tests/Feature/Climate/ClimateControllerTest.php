<?php

use App\Climate\ClimateAutomation;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\Fakes\FakeCarrier;

beforeEach(function () {
    Http::preventStrayRequests();
});

it('lists every unit with its state and capabilities', function () {
    FakeCarrier::install([
        '101' => FakeCarrier::unit('Oficina', power: true, temperature: 24.5, indoor: 27),
        '102' => FakeCarrier::unit('Cocina'),
    ]);

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->getJson(route('api.climate.index'))
        ->assertOk()
        ->assertJsonPath('data.configured', true)
        ->assertJsonPath('data.units.0.name', 'Oficina')
        ->assertJsonPath('data.units.0.state.power', true)
        ->assertJsonPath('data.units.0.state.target_temperature', 24.5)
        ->assertJsonPath('data.units.0.state.mode', 'cool')
        ->assertJsonPath('data.units.0.state.indoor_temperature', 27)
        ->assertJsonPath('data.units.0.capabilities.modes', ['cool', 'heat', 'dry', 'fan', 'auto'])
        ->assertJsonPath('data.units.1.state.power', false)
        ->assertJsonPath('data.automation.enabled', true);
});

it('keeps listing when one unit is offline', function () {
    $carrier = FakeCarrier::install([
        '101' => FakeCarrier::unit('Oficina'),
        '102' => FakeCarrier::unit('Cocina'),
    ]);
    $carrier->offline = ['102'];

    $this->actingAs(User::factory()->create(['family_member' => 'saida']))
        ->getJson(route('api.climate.index'))
        ->assertOk()
        ->assertJsonPath('data.units.0.online', true)
        ->assertJsonPath('data.units.1.online', false)
        ->assertJsonPath('data.units.1.state', null);
});

it('reports when the units are not connected', function () {
    config(['services.carrier.email' => null]);

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->getJson(route('api.climate.index'))
        ->assertOk()
        ->assertJsonPath('data.configured', false)
        ->assertJsonPath('data.units', []);
});

it('changes a unit and returns the state it confirms', function () {
    $carrier = FakeCarrier::install(['101' => FakeCarrier::unit('Oficina', power: false, temperature: 27)]);

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->patchJson(route('api.climate.units.update', ['unit' => '101']), [
            'power' => true,
            'target_temperature' => 23,
            'mode' => 'cool',
        ])
        ->assertOk()
        ->assertJsonPath('data.state.power', true)
        ->assertJsonPath('data.state.target_temperature', 23);

    expect($carrier->units['101']['power'])->toBeTrue()
        ->and($carrier->units['101']['temperature'])->toEqual(23.0);
});

it('signs in again when another device took the session', function () {
    $carrier = FakeCarrier::install(['101' => FakeCarrier::unit('Oficina')]);
    $user = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($user)->getJson(route('api.climate.index'))->assertOk();
    $carrier->endSessionOnce = true;

    $this->actingAs($user)
        ->patchJson(route('api.climate.units.update', ['unit' => '101']), ['power' => true])
        ->assertOk()
        ->assertJsonPath('data.state.power', true);

    expect($carrier->logins)->toBe(2);
});

it('says when a unit is offline', function () {
    $carrier = FakeCarrier::install(['101' => FakeCarrier::unit('Oficina')]);
    $carrier->offline = ['101'];

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->patchJson(route('api.climate.units.update', ['unit' => '101']), ['power' => true])
        ->assertStatus(409);
});

it('validates the change', function () {
    FakeCarrier::install(['101' => FakeCarrier::unit('Oficina')]);

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->patchJson(route('api.climate.units.update', ['unit' => '101']), ['mode' => 'turbo', 'target_temperature' => 40])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['mode', 'target_temperature']);
});

it('is only for the parents', function () {
    FakeCarrier::install(['101' => FakeCarrier::unit('Oficina')]);

    $this->actingAs(User::factory()->create(['family_member' => 'regina']))
        ->getJson(route('api.climate.index'))
        ->assertForbidden();
});

it('saves the home location and the switch', function () {
    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->patchJson(route('api.climate.automation.update'), [
            'enabled' => false,
            'home' => ['latitude' => 20.9674, 'longitude' => -89.5926],
        ])
        ->assertOk()
        ->assertJsonPath('data.enabled', false)
        ->assertJsonPath('data.home.radius', ClimateAutomation::DEFAULT_RADIUS);

    expect(Setting::get(ClimateAutomation::SETTING_KEY)['home']['latitude'])->toBe(20.9674);
});

it('asks a unit again when the relay loses its answer once', function () {
    $carrier = FakeCarrier::install(['101' => FakeCarrier::unit('Oficina')]);
    $carrier->loseNextReply = true;

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->patchJson(route('api.climate.units.update', ['unit' => '101']), ['power' => true])
        ->assertOk()
        ->assertJsonPath('data.state.power', true);
});
