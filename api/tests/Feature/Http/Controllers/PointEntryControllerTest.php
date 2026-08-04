<?php

use App\Models\Chore;
use App\Models\ChoreLog;
use App\Models\Reward;
use App\Models\User;

it('hands out points by hand', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $reward = Reward::factory()->create(['family_member' => 'regina', 'cost' => 20]);

    $this->actingAs($alfonso)
        ->postJson(route('api.kids.points.store', ['member' => 'regina']), [
            'delta' => 5,
            'reason' => 'Ayudó con la maleta',
        ])
        ->assertCreated()
        ->assertJsonPath('data.delta', 5)
        ->assertJsonPath('data.label', 'Ayudó con la maleta')
        ->assertJsonPath('balance', 5);

    // Adjustments land in whatever the kid is saving for.
    $this->actingAs($alfonso)
        ->getJson(route('api.kids.rewards.index', ['member' => 'regina']))
        ->assertJsonPath('data.0.saved', 5);

    expect($reward->fresh()->is_active)->toBeTrue();
});

it('takes points back', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    Reward::factory()->create(['family_member' => 'regina', 'cost' => 20]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 8]);

    $this->actingAs($alfonso)
        ->postJson(route('api.kids.points.store', ['member' => 'regina']), [
            'delta' => -3,
            'reason' => 'Se le contó de más',
        ])
        ->assertCreated()
        ->assertJsonPath('balance', 5);
});

it('will not push a kid below zero', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 2]);

    $this->actingAs($alfonso)
        ->postJson(route('api.kids.points.store', ['member' => 'regina']), [
            'delta' => -5,
            'reason' => 'Demasiado',
        ])
        ->assertUnprocessable();
});

it('validates the adjustment', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.kids.points.store', ['member' => 'regina']), [
            'delta' => 0,
            'reason' => '',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['delta', 'reason']);
});

it('lists where the points came from', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $chore = Chore::factory()->create(['family_member' => 'regina', 'name' => 'Tender la cama']);
    Reward::factory()->create(['family_member' => 'regina', 'cost' => 20]);
    ChoreLog::factory()->approved()->create([
        'chore_id' => $chore->id,
        'family_member' => 'regina',
        'points' => 4,
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.kids.points.store', ['member' => 'regina']), [
            'delta' => 2,
            'reason' => 'Portada increíble',
        ])->assertCreated();

    $response = $this->actingAs($alfonso)
        ->getJson(route('api.kids.points.index', ['member' => 'regina']))
        ->assertOk()
        // Carry-overs move points between goals, so they stay out of the story.
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.label', 'Portada increíble')
        ->assertJsonPath('data.0.author', $alfonso->name)
        ->assertJsonPath('data.1.label', 'Tender la cama');

    expect($response->json('balance'))->toBe(6);
});

it('rejects an unknown kid', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.points.index', ['member' => 'alfonso']))
        ->assertNotFound();
});

it('forbids a non family member from adjusting points', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.kids.points.store', ['member' => 'regina']), [
            'delta' => 5,
            'reason' => 'No',
        ])
        ->assertForbidden();
});

it('requires authentication to read the point history', function () {
    $this->getJson(route('api.kids.points.index', ['member' => 'regina']))
        ->assertUnauthorized();
});
