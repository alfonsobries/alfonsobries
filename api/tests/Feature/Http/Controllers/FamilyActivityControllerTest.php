<?php

use App\Models\FamilyActivity;
use App\Models\PhoneReport;
use App\Models\User;
use App\Services\FamilyTimeBank;

it('lists the activities cheapest first with the minutes saved up', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    FamilyActivity::factory()->create(['name' => 'Ir al parque', 'cost_minutes' => 60]);
    FamilyActivity::factory()->create(['name' => 'Leer un cuento', 'cost_minutes' => 5]);
    PhoneReport::factory()->create();

    $this->actingAs($alfonso)
        ->getJson(route('api.family-activities.index'))
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Leer un cuento')
        ->assertJsonPath('minutes', FamilyTimeBank::MINUTES_PER_REPORT);
});

it('counts the days since the last confirmed report', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    PhoneReport::factory()->create(['date' => now()->subDays(4)->toDateString()]);

    $this->actingAs($alfonso)
        ->getJson(route('api.family-activities.index'))
        ->assertOk()
        ->assertJsonPath('clean_days', 4);
});

it('creates an activity', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.family-activities.store'), [
            'name' => 'Salir en bici',
            'cost_minutes' => 30,
        ])
        ->assertCreated()
        ->assertJson(['data' => ['name' => 'Salir en bici', 'cost_minutes' => 30]]);
});

it('spends the minutes when the family cashes an activity in', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $activity = FamilyActivity::factory()->create(['cost_minutes' => 30]);
    PhoneReport::factory()->create(['family_member' => 'regina']);
    PhoneReport::factory()->create(['family_member' => 'andres']);

    $this->actingAs($alfonso)
        ->postJson(route('api.family-activities.redeem', ['familyActivity' => $activity]))
        ->assertOk()
        ->assertJsonPath('minutes', 0);
});

it('will not cash in more minutes than the bank holds', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $activity = FamilyActivity::factory()->create(['cost_minutes' => 60]);
    PhoneReport::factory()->create();

    $this->actingAs($alfonso)
        ->postJson(route('api.family-activities.redeem', ['familyActivity' => $activity]))
        ->assertUnprocessable();

    expect(app(FamilyTimeBank::class)->balance())->toBe(FamilyTimeBank::MINUTES_PER_REPORT);
});

it('validates the activity payload', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.family-activities.store'), ['name' => '', 'cost_minutes' => 1])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'cost_minutes']);
});

it('removes an activity', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $activity = FamilyActivity::factory()->create();

    $this->actingAs($alfonso)
        ->deleteJson(route('api.family-activities.destroy', ['familyActivity' => $activity]))
        ->assertOk();

    expect(FamilyActivity::whereKey($activity->id)->exists())->toBeFalse();
});

it('forbids a non family member from cashing minutes in', function () {
    $stranger = User::factory()->create(['family_member' => null]);
    $activity = FamilyActivity::factory()->create();

    $this->actingAs($stranger)
        ->postJson(route('api.family-activities.redeem', ['familyActivity' => $activity]))
        ->assertForbidden();
});

it('requires authentication to list the activities', function () {
    $this->getJson(route('api.family-activities.index'))
        ->assertUnauthorized();
});
