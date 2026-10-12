<?php

use App\Climate\ClimateAutomation;
use App\Climate\Presence;
use App\Models\User;
use App\Notifications\ClimateAutomationNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\Fakes\FakeCarrier;

beforeEach(function () {
    Http::preventStrayRequests();
    Notification::fake();

    $this->carrier = FakeCarrier::install([
        '101' => FakeCarrier::unit('Oficina', power: true, temperature: 23),
        '102' => FakeCarrier::unit('Cocina', power: true),
        '103' => FakeCarrier::unit('Cuarto Regina', power: false),
    ]);

    $this->alfonso = User::factory()->create(['family_member' => 'alfonso', 'name' => 'Alfonso Bribiesca']);
    $this->saida = User::factory()->create(['family_member' => 'saida', 'name' => 'Saida']);
});

function leave(User $user, int $minutesAgo = 10): void
{
    $user->forceFill(['presence' => Presence::Away, 'presence_changed_at' => now()->subMinutes($minutesAgo)])->save();
}

it('switches off the units that are on once nobody is home', function () {
    leave($this->alfonso);
    leave($this->saida);

    $this->artisan('climate:enforce')->assertSuccessful();

    expect($this->carrier->units['101']['power'])->toBeFalse()
        ->and($this->carrier->units['102']['power'])->toBeFalse()
        ->and(app(ClimateAutomation::class)->settings()['switched_off'])->toBe(['101', '102']);

    Notification::assertSentTo([$this->alfonso, $this->saida], ClimateAutomationNotification::class);
});

it('waits a few minutes after the last person leaves', function () {
    leave($this->alfonso);
    leave($this->saida, minutesAgo: 2);

    $this->artisan('climate:enforce')->assertSuccessful();

    expect($this->carrier->units['101']['power'])->toBeTrue();
});

it('does nothing while someone is home', function () {
    leave($this->alfonso);
    $this->saida->forceFill(['presence' => Presence::Home, 'presence_changed_at' => now()->subHour()])->save();

    $this->artisan('climate:enforce')->assertSuccessful();

    expect($this->carrier->units['101']['power'])->toBeTrue();
});

it('treats a parent who never reported a location as home', function () {
    leave($this->alfonso);

    $this->artisan('climate:enforce')->assertSuccessful();

    expect($this->carrier->units['101']['power'])->toBeTrue();
});

it('acts once per absence, leaving units switched on remotely alone', function () {
    leave($this->alfonso);
    leave($this->saida);
    $this->artisan('climate:enforce');

    $this->carrier->units['103']['power'] = true;
    $this->artisan('climate:enforce');

    expect($this->carrier->units['103']['power'])->toBeTrue();
});

it('switches the same units back on when someone returns', function () {
    leave($this->alfonso);
    leave($this->saida);
    $this->artisan('climate:enforce');

    $this->actingAs($this->saida)
        ->postJson(route('api.presence.store'), ['state' => 'home'])
        ->assertOk()
        ->assertJsonPath('data.switched_off', []);

    expect($this->carrier->units['101']['power'])->toBeTrue()
        ->and($this->carrier->units['101']['temperature'])->toEqual(23.0)
        ->and($this->carrier->units['102']['power'])->toBeTrue()
        ->and($this->carrier->units['103']['power'])->toBeFalse()
        ->and($this->saida->fresh()->presence)->toBe(Presence::Home);

    Notification::assertSentTo($this->alfonso, ClimateAutomationNotification::class, 2);
});

it('switches off again on the next absence', function () {
    leave($this->alfonso);
    leave($this->saida);
    $this->artisan('climate:enforce');
    app(ClimateAutomation::class)->recordPresence($this->alfonso, Presence::Home);

    leave($this->alfonso);
    $this->artisan('climate:enforce');

    expect($this->carrier->units['101']['power'])->toBeFalse();
});

it('retries units it could not reach', function () {
    leave($this->alfonso);
    leave($this->saida);
    $this->carrier->offline = ['102'];
    $this->artisan('climate:enforce');

    expect($this->carrier->units['102']['power'])->toBeTrue();

    $this->carrier->offline = [];
    $this->artisan('climate:enforce');

    expect($this->carrier->units['102']['power'])->toBeFalse()
        ->and(app(ClimateAutomation::class)->settings()['switched_off'])->toBe(['101', '102']);
});

it('does nothing when switched off, and forgets a pending restore', function () {
    leave($this->alfonso);
    leave($this->saida);
    $this->artisan('climate:enforce');
    app(ClimateAutomation::class)->configure(['enabled' => false]);

    app(ClimateAutomation::class)->recordPresence($this->saida, Presence::Home);

    expect($this->carrier->units['101']['power'])->toBeFalse();

    leave($this->saida);
    $this->artisan('climate:enforce');

    expect(app(ClimateAutomation::class)->settings()['switched_off'])->toBeNull();
});

it('records presence for the signed in parent', function () {
    $this->actingAs($this->alfonso)
        ->postJson(route('api.presence.store'), ['state' => 'away'])
        ->assertOk()
        ->assertJsonPath('data.people.0.member', 'alfonso')
        ->assertJsonPath('data.people.0.presence', 'away');

    $this->actingAs($this->alfonso)
        ->postJson(route('api.presence.store'), ['state' => 'somewhere'])
        ->assertUnprocessable();
});

it('tells each parent who else is away when switching off', function () {
    leave($this->alfonso);
    leave($this->saida);

    $this->artisan('climate:enforce');

    Notification::assertSentTo($this->alfonso, ClimateAutomationNotification::class, function (ClimateAutomationNotification $notification) {
        return $notification->title() === 'Aires apagados'
            && $notification->body($this->alfonso) === 'Ni tú ni Saida están cerca de la casa, así que apagué 2 aires.';
    });

    Notification::assertSentTo($this->saida, ClimateAutomationNotification::class, function (ClimateAutomationNotification $notification) {
        return $notification->body($this->saida) === 'Ni tú ni Alfonso están cerca de la casa, así que apagué 2 aires.';
    });
});

it('tells who got home when switching back on', function () {
    leave($this->alfonso);
    leave($this->saida);
    $this->artisan('climate:enforce');

    app(ClimateAutomation::class)->recordPresence($this->saida, Presence::Home);

    Notification::assertSentTo($this->alfonso, ClimateAutomationNotification::class, function (ClimateAutomationNotification $notification) {
        return $notification->switchedOn
            && $notification->body($this->alfonso) === 'Saida llegó a casa, así que volví a prender 2 aires.';
    });

    Notification::assertSentTo($this->saida, ClimateAutomationNotification::class, function (ClimateAutomationNotification $notification) {
        return $notification->switchedOn
            && $notification->body($this->saida) === 'Llegaste a casa, así que volví a prender 2 aires.';
    });
});
