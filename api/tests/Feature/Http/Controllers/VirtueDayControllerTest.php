<?php

use App\Models\User;
use App\Models\VirtueDay;

it('lists the tracked days with stats', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    VirtueDay::factory()->create([
        'date' => now()->subDays(2)->toDateString(),
        'prayers_completed_at' => now()->subDays(2),
        'resolution' => VirtueDay::RESOLUTION_KEPT,
    ]);
    VirtueDay::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_KEPT,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.prayers_completed', true)
        ->assertJsonPath('data.1.prayers_completed', false)
        ->assertJsonPath('stats.streak', 3)
        ->assertJsonPath('stats.days_tracked', 3)
        ->assertJsonPath('stats.kept_count', 2)
        ->assertJsonPath('stats.missed_count', 0);
});

it('counts the streak from the day after the last miss', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    VirtueDay::factory()->create([
        'date' => now()->subDays(10)->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_KEPT,
    ]);
    VirtueDay::factory()->create([
        'date' => now()->subDays(4)->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_MISSED,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.streak', 4)
        ->assertJsonPath('stats.days_tracked', 11)
        ->assertJsonPath('stats.missed_count', 1);
});

it('resets the streak when today is missed', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    VirtueDay::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_KEPT,
    ]);
    VirtueDay::factory()->create([
        'date' => now()->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_MISSED,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.streak', 0);
});

it('keeps the streak running over pending days', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    // Marked three days ago, nothing since — pending days don't break it.
    VirtueDay::factory()->create([
        'date' => now()->subDays(3)->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_KEPT,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.streak', 4);
});

it('marks a resolution for a day', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.resolution', ['date' => $date]), [
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ])
        ->assertOk()
        ->assertJsonPath('data.date', $date)
        ->assertJsonPath('data.resolution', 'kept')
        ->assertJsonPath('stats.streak', 1);

    expect(VirtueDay::count())->toBe(1);
});

it('marks yesterday retroactively', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $yesterday = now()->subDay()->toDateString();

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.resolution', ['date' => $yesterday]), [
            'resolution' => VirtueDay::RESOLUTION_MISSED,
        ])
        ->assertOk()
        ->assertJsonPath('data.resolution', 'missed')
        ->assertJsonPath('stats.streak', 1);
});

it('clears a resolution back to pending', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $day = VirtueDay::factory()->create([
        'date' => now()->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_KEPT,
    ]);

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.resolution', ['date' => $day->date->toDateString()]), [
            'resolution' => null,
        ])
        ->assertOk()
        ->assertJsonPath('data.resolution', null);
});

it('rejects an invalid resolution value', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.resolution', ['date' => now()->toDateString()]), [
            'resolution' => 'maybe',
        ])
        ->assertUnprocessable();
});

it('rejects a resolution too far in the future', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.resolution', ['date' => now()->addDays(3)->toDateString()]), [
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ])
        ->assertUnprocessable();
});

it('rejects a malformed date', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.resolution', ['date' => '2026-02-31']), [
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ])
        ->assertUnprocessable();
});

it('completes the prayers for a day', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();

    $this->actingAs($alfonso)
        ->postJson(route('api.virtue.prayers.store'), ['date' => $date])
        ->assertOk()
        ->assertJsonPath('data.date', $date)
        ->assertJsonPath('data.prayers_completed', true);

    expect(VirtueDay::count())->toBe(1);
});

it('keeps the first completion when the prayers repeat', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $completedAt = now()->subHours(3);
    $day = VirtueDay::factory()->create([
        'date' => now()->toDateString(),
        'prayers_completed_at' => $completedAt,
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.virtue.prayers.store'), ['date' => $day->date->toDateString()])
        ->assertOk()
        ->assertJsonPath('data.prayers_completed', true);

    expect($day->fresh()->prayers_completed_at->timestamp)->toBe($completedAt->timestamp);
});

it('is not available to other family members', function () {
    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)
        ->getJson(route('api.virtue.days.index'))
        ->assertForbidden();

    $this->actingAs($saida)
        ->postJson(route('api.virtue.prayers.store'), ['date' => now()->toDateString()])
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->getJson(route('api.virtue.days.index'))->assertUnauthorized();
});
