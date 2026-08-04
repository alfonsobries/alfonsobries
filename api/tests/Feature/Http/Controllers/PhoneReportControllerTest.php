<?php

use App\Models\PhoneReport;
use App\Models\User;
use App\Services\FamilyTimeBank;

it('lets a kid report the phone', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.store'), ['family_member' => 'regina'])
        ->assertCreated()
        ->assertJsonPath('data.status', PhoneReport::STATUS_PENDING)
        ->assertJsonPath('data.family_member', 'regina');
});

it('is one report a day each', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.store'), ['family_member' => 'regina'])
        ->assertCreated();

    // The second press returns the same report instead of a new one.
    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.store'), ['family_member' => 'regina'])
        ->assertOk();

    expect(PhoneReport::count())->toBe(1);

    // The other kid still has their own.
    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.store'), ['family_member' => 'andres'])
        ->assertCreated();

    expect(PhoneReport::count())->toBe(2);
});

it('breaks the day at the family midnight, not the server one', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    // Evening in Mexico is already tomorrow in UTC — still the same day for
    // the kids, so the second press must not buy a second report.
    $this->travelTo(now()->parse('2026-08-04 20:00:00', config('family.timezone')));

    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.store'), ['family_member' => 'regina'])
        ->assertCreated();

    $this->travelTo(now()->parse('2026-08-04 22:30:00', config('family.timezone')));

    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.store'), ['family_member' => 'regina'])
        ->assertOk();

    expect(PhoneReport::count())->toBe(1);
    expect(PhoneReport::first()->date->toDateString())->toBe('2026-08-04');
});

it('adds minutes to the family bank when confirmed', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $report = PhoneReport::factory()->create();

    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.review', ['phoneReport' => $report]), ['confirmed' => true])
        ->assertOk()
        ->assertJsonPath('data.status', PhoneReport::STATUS_CONFIRMED)
        ->assertJsonPath('minutes', FamilyTimeBank::MINUTES_PER_REPORT);
});

it('owes nothing when it was work', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $report = PhoneReport::factory()->create();

    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.review', ['phoneReport' => $report]), ['confirmed' => false])
        ->assertOk()
        ->assertJsonPath('data.status', PhoneReport::STATUS_WORK)
        ->assertJsonPath('minutes', 0);
});

it('takes the minutes back when the answer changes', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $report = PhoneReport::factory()->confirmed()->create();

    expect(app(FamilyTimeBank::class)->balance())->toBe(FamilyTimeBank::MINUTES_PER_REPORT);

    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.review', ['phoneReport' => $report]), ['confirmed' => false])
        ->assertOk()
        ->assertJsonPath('minutes', 0);
});

it('lists the recent reports', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    PhoneReport::factory()->confirmed()->create(['family_member' => 'regina']);
    PhoneReport::factory()->create([
        'family_member' => 'andres',
        'date' => now()->subDay()->toDateString(),
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.phone-reports.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.family_member', 'regina')
        ->assertJsonPath('data.0.minutes', FamilyTimeBank::MINUTES_PER_REPORT)
        ->assertJsonPath('minutes', FamilyTimeBank::MINUTES_PER_REPORT);
});

it('only reports on the kids', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.phone-reports.store'), ['family_member' => 'alfonso'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['family_member']);
});

it('forbids a non family member from reporting', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.phone-reports.store'), ['family_member' => 'regina'])
        ->assertForbidden();
});

it('requires authentication to report', function () {
    $this->postJson(route('api.phone-reports.store'), ['family_member' => 'regina'])
        ->assertUnauthorized();
});
