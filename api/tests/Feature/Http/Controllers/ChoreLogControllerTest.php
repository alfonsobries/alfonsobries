<?php

use App\Models\Chore;
use App\Models\ChoreLog;
use App\Models\User;

it('lets a kid check a chore for today', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $chore = Chore::factory()->create(['family_member' => 'regina', 'points' => 2]);

    $this->actingAs($alfonso)
        ->postJson(route('api.chores.logs.store', ['chore' => $chore]))
        ->assertCreated()
        ->assertJson([
            'data' => [
                'family_member' => 'regina',
                'status' => ChoreLog::STATUS_DONE,
                'points' => 2,
                'date' => now()->toDateString(),
            ],
        ]);
});

it('is idempotent when checking twice the same day', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $chore = Chore::factory()->create(['family_member' => 'regina']);

    $this->actingAs($alfonso)->postJson(route('api.chores.logs.store', ['chore' => $chore]))->assertCreated();
    $this->actingAs($alfonso)->postJson(route('api.chores.logs.store', ['chore' => $chore]))->assertOk();

    expect(ChoreLog::count())->toBe(1);
});

it('unchecks an unreviewed chore', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $log = ChoreLog::factory()->create();

    $this->actingAs($alfonso)
        ->deleteJson(route('api.chore-logs.destroy', ['choreLog' => $log]))
        ->assertOk();

    expect(ChoreLog::count())->toBe(0);
});

it('will not uncheck a reviewed chore', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $log = ChoreLog::factory()->approved()->create();

    $this->actingAs($alfonso)
        ->deleteJson(route('api.chore-logs.destroy', ['choreLog' => $log]))
        ->assertUnprocessable();

    expect(ChoreLog::count())->toBe(1);
});

it('approves a check and lifts the reviewer mood', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 5]);
    $log = ChoreLog::factory()->create(['points' => 2]);

    $this->actingAs($alfonso)
        ->postJson(route('api.chore-logs.review', ['choreLog' => $log]), ['approved' => true])
        ->assertOk()
        ->assertJsonPath('data.status', ChoreLog::STATUS_APPROVED);

    expect($alfonso->fresh()->mood)->toBe(7);
    expect($log->fresh()->reviewed_by)->toBe($alfonso->id);
});

it('never lifts the mood above the scale maximum', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 9]);
    $log = ChoreLog::factory()->create(['points' => 3]);

    $this->actingAs($alfonso)
        ->postJson(route('api.chore-logs.review', ['choreLog' => $log]), ['approved' => true])
        ->assertOk();

    expect($alfonso->fresh()->mood)->toBe(User::MOOD_MAX);
});

it('rejects a check without touching the mood', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'mood' => 5]);
    $log = ChoreLog::factory()->create();

    $this->actingAs($alfonso)
        ->postJson(route('api.chore-logs.review', ['choreLog' => $log]), ['approved' => false])
        ->assertOk()
        ->assertJsonPath('data.status', ChoreLog::STATUS_REJECTED);

    expect($alfonso->fresh()->mood)->toBe(5);
});

it('will not review twice', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $log = ChoreLog::factory()->approved()->create();

    $this->actingAs($alfonso)
        ->postJson(route('api.chore-logs.review', ['choreLog' => $log]), ['approved' => false])
        ->assertUnprocessable();
});

it('lists today checks filtered by kid', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $regina = Chore::factory()->create(['family_member' => 'regina']);
    $andres = Chore::factory()->create(['family_member' => 'andres']);
    ChoreLog::factory()->create(['chore_id' => $regina->id, 'family_member' => 'regina']);
    ChoreLog::factory()->create(['chore_id' => $andres->id, 'family_member' => 'andres']);
    ChoreLog::factory()->create(['family_member' => 'regina', 'date' => now()->subDay()->toDateString()]);

    $this->actingAs($alfonso)
        ->getJson(route('api.chore-logs.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.family_member', 'regina');
});

it('forbids a non family member from checking chores', function () {
    $stranger = User::factory()->create(['family_member' => null]);
    $chore = Chore::factory()->create();

    $this->actingAs($stranger)
        ->postJson(route('api.chores.logs.store', ['chore' => $chore]))
        ->assertForbidden();
});
