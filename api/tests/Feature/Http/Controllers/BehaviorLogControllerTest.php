<?php

use App\Models\Behavior;
use App\Models\BehaviorLog;
use App\Models\User;

it('logs a behavior without touching the mood', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 7]);
    $behavior = Behavior::factory()->create(['family_member' => 'regina', 'name' => 'Shouting', 'points' => 1]);

    $this->actingAs($alfonso)
        ->postJson(route('api.behaviors.logs.store', ['behavior' => $behavior]), [
            'affected_mood' => false,
        ])
        ->assertCreated()
        ->assertJson([
            'data' => [
                'family_member' => 'regina',
                'behavior' => ['name' => 'Shouting'],
                'points' => 1,
                'affected_mood' => false,
                'mood_emoji' => null,
                'logged_by' => ['family_member' => 'alfonso'],
            ],
        ]);

    expect($alfonso->fresh()->mood)->toBe(7);
});

it('lowers the logging parent mood when the behavior affected it', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 7]);
    $behavior = Behavior::factory()->create(['family_member' => 'regina', 'points' => 2]);

    $this->actingAs($alfonso)
        ->postJson(route('api.behaviors.logs.store', ['behavior' => $behavior]), [
            'affected_mood' => true,
            'mood_emoji' => '😤',
        ])
        ->assertCreated()
        ->assertJson(['data' => ['affected_mood' => true, 'mood_emoji' => '😤', 'points' => 2]]);

    expect($alfonso->fresh()->mood)->toBe(5);
});

it('never lowers the mood below the scale minimum', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 1]);
    $behavior = Behavior::factory()->create(['family_member' => 'regina', 'points' => 3]);

    $this->actingAs($alfonso)
        ->postJson(route('api.behaviors.logs.store', ['behavior' => $behavior]), [
            'affected_mood' => true,
        ])
        ->assertCreated();

    expect($alfonso->fresh()->mood)->toBe(User::MOOD_MIN);
});

it('ignores the emoji when the mood was not affected', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $behavior = Behavior::factory()->create(['family_member' => 'regina']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behaviors.logs.store', ['behavior' => $behavior]), [
            'affected_mood' => false,
            'mood_emoji' => '😤',
        ])
        ->assertCreated()
        ->assertJson(['data' => ['mood_emoji' => null]]);
});

it('paginates the feed', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $behavior = Behavior::factory()->create(['family_member' => 'regina']);
    BehaviorLog::factory()->count(25)->create([
        'behavior_id' => $behavior->id,
        'family_member' => 'regina',
        'user_id' => $alfonso->id,
    ]);

    $first = $this->actingAs($alfonso)
        ->getJson(route('api.behavior-logs.index'))
        ->assertOk()
        ->assertJsonCount(20, 'data');
    expect($first->json('next_page'))->toBe(2);

    $second = $this->actingAs($alfonso)
        ->getJson(route('api.behavior-logs.index', ['page' => 2]))
        ->assertOk()
        ->assertJsonCount(5, 'data');
    expect($second->json('next_page'))->toBeNull();
});

it('lists the feed newest first', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $shouting = Behavior::factory()->create(['family_member' => 'regina', 'name' => 'Shouting']);
    $tantrum = Behavior::factory()->create(['family_member' => 'andres', 'name' => 'Tantrum']);

    BehaviorLog::factory()->create(['behavior_id' => $shouting->id, 'family_member' => 'regina', 'user_id' => $alfonso->id]);
    BehaviorLog::factory()->create(['behavior_id' => $tantrum->id, 'family_member' => 'andres', 'user_id' => $alfonso->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.behavior-logs.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.behavior.name', 'Tantrum')
        ->assertJsonPath('data.1.behavior.name', 'Shouting');
});

it('filters the feed by kid', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $shouting = Behavior::factory()->create(['family_member' => 'regina']);
    $tantrum = Behavior::factory()->create(['family_member' => 'andres']);

    BehaviorLog::factory()->create(['behavior_id' => $shouting->id, 'family_member' => 'regina', 'user_id' => $alfonso->id]);
    BehaviorLog::factory()->create(['behavior_id' => $tantrum->id, 'family_member' => 'andres', 'user_id' => $alfonso->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.behavior-logs.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.family_member', 'regina');
});

it('keeps showing logs of a retired behavior', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $behavior = Behavior::factory()->create(['family_member' => 'regina', 'name' => 'Shouting']);
    BehaviorLog::factory()->create(['behavior_id' => $behavior->id, 'family_member' => 'regina', 'user_id' => $alfonso->id]);

    $behavior->delete();

    $this->actingAs($alfonso)
        ->getJson(route('api.behavior-logs.index'))
        ->assertOk()
        ->assertJsonPath('data.0.behavior.name', 'Shouting');
});

it('undoes a log and gives the mood points back', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 4]);
    $behavior = Behavior::factory()->create(['family_member' => 'regina', 'points' => 2]);
    $log = BehaviorLog::factory()->create([
        'behavior_id' => $behavior->id,
        'family_member' => 'regina',
        'user_id' => $alfonso->id,
        'points' => 2,
        'affected_mood' => true,
    ]);

    $this->actingAs($alfonso)
        ->deleteJson(route('api.behavior-logs.destroy', ['behaviorLog' => $log]))
        ->assertOk();

    expect(BehaviorLog::count())->toBe(0);
    expect($alfonso->fresh()->mood)->toBe(6);
});

it('never raises the mood above the scale maximum when undoing', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 9]);
    $behavior = Behavior::factory()->create(['family_member' => 'regina', 'points' => 3]);
    $log = BehaviorLog::factory()->create([
        'behavior_id' => $behavior->id,
        'family_member' => 'regina',
        'user_id' => $alfonso->id,
        'points' => 3,
        'affected_mood' => true,
    ]);

    $this->actingAs($alfonso)
        ->deleteJson(route('api.behavior-logs.destroy', ['behaviorLog' => $log]))
        ->assertOk();

    expect($alfonso->fresh()->mood)->toBe(User::MOOD_MAX);
});

it('forbids a non family member from logging', function () {
    $stranger = User::factory()->create(['family_member' => null]);
    $behavior = Behavior::factory()->create(['family_member' => 'regina']);

    $this->actingAs($stranger)
        ->postJson(route('api.behaviors.logs.store', ['behavior' => $behavior]), [
            'affected_mood' => false,
        ])
        ->assertForbidden();
});

it('requires authentication to read the feed', function () {
    $this->getJson(route('api.behavior-logs.index'))->assertUnauthorized();
});
