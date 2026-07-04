<?php

use App\Models\ChoreLog;
use App\Models\Reward;
use App\Models\User;

it('lists rewards with the kid points balance', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    Reward::factory()->create(['family_member' => 'regina', 'name' => 'Ir al cine', 'cost' => 10]);
    Reward::factory()->achieved()->create(['family_member' => 'regina', 'name' => 'Helado', 'cost' => 3]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 5]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 4]);
    ChoreLog::factory()->create(['family_member' => 'regina', 'points' => 9]);

    $response = $this->actingAs($alfonso)
        ->getJson(route('api.kids.rewards.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        // Pending first, so the app's progress card points at it.
        ->assertJsonPath('data.0.name', 'Ir al cine');

    // 5 + 4 approved, minus the 3 already spent; unreviewed points don't count.
    expect($response->json('balance'))->toBe(6);
});

it('creates a reward', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.store'), [
            'family_member' => 'regina',
            'name' => 'Ir al cine',
            'cost' => 15,
        ])
        ->assertCreated()
        ->assertJson(['data' => ['name' => 'Ir al cine', 'cost' => 15, 'achieved_at' => null]]);
});

it('redeems a reward when the kid has enough points', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $reward = Reward::factory()->create(['family_member' => 'regina', 'cost' => 5]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 6]);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.rewards.redeem', ['reward' => $reward]))
        ->assertOk();

    expect($reward->fresh()->isAchieved())->toBeTrue();
    expect($response->json('balance'))->toBe(1);
});

it('will not redeem without enough points', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $reward = Reward::factory()->create(['family_member' => 'regina', 'cost' => 5]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 2]);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.redeem', ['reward' => $reward]))
        ->assertUnprocessable();

    expect($reward->fresh()->isAchieved())->toBeFalse();
});

it('will not redeem twice', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $reward = Reward::factory()->achieved()->create(['family_member' => 'regina']);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.redeem', ['reward' => $reward]))
        ->assertUnprocessable();
});

it('validates the reward payload', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.store'), [
            'family_member' => 'alfonso',
            'name' => '',
            'cost' => 0,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['family_member', 'name', 'cost']);
});

it('forbids a non family member from managing rewards', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.rewards.store'), [
            'family_member' => 'regina',
            'name' => 'Cine',
            'cost' => 5,
        ])
        ->assertForbidden();
});

it('requires authentication to list rewards', function () {
    $this->getJson(route('api.kids.rewards.index', ['member' => 'regina']))
        ->assertUnauthorized();
});
