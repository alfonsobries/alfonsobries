<?php

use App\Models\ChoreLog;
use App\Models\Reward;
use App\Models\User;

it('lists rewards with the kid points balance', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    Reward::factory()->create(['family_member' => 'regina', 'name' => 'Ir al cine', 'cost' => 10]);
    Reward::factory()->create(['family_member' => 'regina', 'name' => 'Helado', 'cost' => 3]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 5]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 4]);
    ChoreLog::factory()->create(['family_member' => 'regina', 'points' => 9]);

    $response = $this->actingAs($alfonso)
        ->getJson(route('api.kids.rewards.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        // The first goal took over on its own, so it leads the list.
        ->assertJsonPath('data.0.name', 'Ir al cine')
        ->assertJsonPath('data.0.is_active', true)
        // 5 + 4 approved; the unreviewed check earns nothing yet.
        ->assertJsonPath('data.0.saved', 9)
        // Each goal keeps its own jar — the second one has saved nothing.
        ->assertJsonPath('data.1.is_active', false)
        ->assertJsonPath('data.1.saved', 0);

    expect($response->json('balance'))->toBe(9);
});

it('sends new points to the goal the kid switched to, leaving the old jar untouched', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $bike = Reward::factory()->create(['family_member' => 'regina', 'cost' => 20]);
    $movie = Reward::factory()->create(['family_member' => 'regina', 'cost' => 30]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 7]);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.activate', ['reward' => $movie]))
        ->assertOk()
        ->assertJsonPath('data.is_active', true)
        ->assertJsonPath('data.saved', 0);

    expect($bike->fresh()->is_active)->toBeFalse();

    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 3]);

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.rewards.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonPath('data.0.name', $movie->name)
        ->assertJsonPath('data.0.saved', 3)
        ->assertJsonPath('data.1.name', $bike->name)
        ->assertJsonPath('data.1.saved', 7);
});

it('hands the leftover points to the next goal after redeeming', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $ice = Reward::factory()->create(['family_member' => 'regina', 'cost' => 4]);
    $movie = Reward::factory()->create(['family_member' => 'regina', 'cost' => 30]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 10]);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.redeem', ['reward' => $ice]))
        ->assertOk();

    expect($movie->fresh()->is_active)->toBeTrue();

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.rewards.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonPath('data.0.name', $movie->name)
        ->assertJsonPath('data.0.saved', 6);
});

it('gives a removed goal its points back', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $bike = Reward::factory()->create(['family_member' => 'regina', 'cost' => 20]);
    $movie = Reward::factory()->create(['family_member' => 'regina', 'cost' => 30]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 8]);

    $this->actingAs($alfonso)
        ->deleteJson(route('api.rewards.destroy', ['reward' => $bike]))
        ->assertOk();

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.rewards.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', $movie->name)
        ->assertJsonPath('data.0.is_active', true)
        ->assertJsonPath('data.0.saved', 8);
});

it('keeps the points until a goal exists to save them into', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 6]);

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.rewards.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonPath('free', 6);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.store'), [
            'family_member' => 'regina',
            'name' => 'Ir al cine',
            'cost' => 15,
        ])
        ->assertCreated()
        ->assertJsonPath('data.is_active', true)
        ->assertJsonPath('data.saved', 6);
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

it('will not redeem before its date', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $reward = Reward::factory()->create([
        'family_member' => 'regina',
        'cost' => 1,
        'available_on' => now()->addDays(3)->toDateString(),
    ]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 5]);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.redeem', ['reward' => $reward]))
        ->assertUnprocessable();
});

it('will not redeem while a parent is below content', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 7]);
    User::factory()->create(['family_member' => 'saida', 'mood' => 4]);
    $reward = Reward::factory()->create([
        'family_member' => 'regina',
        'cost' => 1,
        'requires_content_parents' => true,
    ]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 5]);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.redeem', ['reward' => $reward]))
        ->assertUnprocessable();
});

it('redeems when both parents are content', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 7]);
    User::factory()->create(['family_member' => 'saida', 'mood' => 6]);
    $reward = Reward::factory()->create([
        'family_member' => 'regina',
        'cost' => 1,
        'requires_content_parents' => true,
    ]);
    ChoreLog::factory()->approved()->create(['family_member' => 'regina', 'points' => 5]);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.redeem', ['reward' => $reward]))
        ->assertOk();

    expect($reward->fresh()->isAchieved())->toBeTrue();
});

it('stores the optional date and mood gate', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.rewards.store'), [
            'family_member' => 'regina',
            'name' => 'Ir al cine',
            'cost' => 15,
            'available_on' => now()->addWeek()->toDateString(),
            'requires_content_parents' => true,
        ])
        ->assertCreated()
        ->assertJsonPath('data.available_on', now()->addWeek()->toDateString())
        ->assertJsonPath('data.requires_content_parents', true);
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
