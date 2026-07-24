<?php

use App\Models\User;
use App\Models\VirtueDay;
use App\Models\VirtueEntry;
use App\Virtue\JourneyArt;

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

it('earns two points per kept day toward the spirit stage', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    foreach (range(1, 8) as $offset) {
        VirtueDay::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ]);
    }

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.points', 16)
        ->assertJsonPath('stats.stage', 3)
        ->assertJsonPath('stats.next_stage_at', 20)
        ->assertJsonPath('stats.stage_count', 30);
});

it('costs five points to miss but never drops below a crossed checkpoint', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    // Twelve kept days (24 points) cross the 22-point checkpoint; the miss lands on the floor.
    foreach (range(2, 13) as $offset) {
        VirtueDay::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ]);
    }

    VirtueDay::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_MISSED,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.points', 22)
        ->assertJsonPath('stats.stage', 4);
});

it('lets a relapse outweigh even a full prayer day', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    foreach (range(2, 3) as $offset) {
        VirtueDay::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ]);
    }

    // Rosary + prayers + relapse = 2 + 1 - 5: the day still ends at -2.
    VirtueDay::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'rosary_completed_at' => now()->subDay(),
        'prayers_completed_at' => now()->subDay(),
        'resolution' => VirtueDay::RESOLUTION_MISSED,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.points', 2);
});

it('drains a point for each past day with no activity at all', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    foreach (range(4, 5) as $offset) {
        VirtueDay::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ]);
    }

    // Three empty days follow the four earned points; today stays in progress.
    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.points', 1);
});

it('never drops the mascot points below zero', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    VirtueDay::factory()->create([
        'date' => now()->subDays(2)->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_KEPT,
    ]);
    VirtueDay::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_MISSED,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.points', 0)
        ->assertJsonPath('stats.stage', 1);
});

it('serves a mascot stage image', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->get(route('api.virtue.mascot', ['set' => 'tierra', 'stage' => 1]))
        ->assertOk();
});

it('returns 404 for an unknown mascot stage', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.mascot', ['set' => 'tierra', 'stage' => 31]))
        ->assertNotFound();
});

it('hides the mascot from other family members', function () {
    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)
        ->getJson(route('api.virtue.mascot', ['set' => 'tierra', 'stage' => 1]))
        ->assertForbidden();
});

it('exposes tree stages 1:1 with the game stage arc', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    // A full day (rosary + prayers + kept) earns five points — exactly stage 2.
    VirtueDay::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'rosary_completed_at' => now()->subDay(),
        'prayers_completed_at' => now()->subDay(),
        'resolution' => VirtueDay::RESOLUTION_KEPT,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.stage', 2)
        ->assertJsonPath('stats.tree_stage', 2)
        ->assertJsonPath('stats.tree_stage_count', 30);
});

it('completes the rosary for a day', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.virtue.rosary.store'), ['date' => now()->toDateString()])
        ->assertOk()
        ->assertJsonPath('data.rosary_completed', true)
        ->assertJsonPath('stats.rosary.total', 1)
        ->assertJsonPath('stats.rosary.month', 1)
        ->assertJsonPath('stats.rosary.streak', 1);

    expect(VirtueDay::whereDate('date', now()->toDateString())->first()->rosary_completed_at)->not->toBeNull();
});

it('keeps the first completion when the rosary repeats', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.virtue.rosary.store'), ['date' => now()->toDateString()])
        ->assertOk();

    $first = VirtueDay::whereDate('date', now()->toDateString())->first()->rosary_completed_at;

    $this->travel(5)->minutes();

    $this->actingAs($alfonso)
        ->postJson(route('api.virtue.rosary.store'), ['date' => now()->toDateString()])
        ->assertOk()
        ->assertJsonPath('stats.rosary.total', 1);

    expect(VirtueDay::whereDate('date', now()->toDateString())->first()->rosary_completed_at)
        ->toEqual($first);
});

it('counts consecutive rosary days as a streak', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    foreach (range(1, 3) as $offset) {
        VirtueDay::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'rosary_completed_at' => now()->subDays($offset),
        ]);
    }

    // A day in progress doesn't break the streak; the three prayed days count.
    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.rosary.total', 3)
        ->assertJsonPath('stats.rosary.streak', 3);
});

it('reaches the final stage on a realistic 90-day practice but not by day 60', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    // A solid week, not a flawless one: six full days and one without prayers.
    $seed = function (int $days): void {
        foreach (range(0, $days - 1) as $index) {
            $offset = $days - 1 - $index;

            VirtueDay::factory()->create([
                'date' => now()->subDays($offset)->toDateString(),
                'rosary_completed_at' => now()->subDays($offset),
                'prayers_completed_at' => $index % 7 === 6 ? null : now()->subDays($offset),
                'resolution' => VirtueDay::RESOLUTION_KEPT,
            ]);
        }
    };

    $seed(60);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.areas.spirit.stage_count', 30);

    expect($this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->json('stats.areas.spirit.stage'))->toBeLessThan(30);

    VirtueDay::query()->delete();
    $seed(91);

    expect($this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->json('stats.areas.spirit.stage'))->toBe(30);
});

it('stamps the art version on the stats so cached art can be busted', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $version = $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->json('stats.art_version');

    expect($version)->toBeString()->not->toBeEmpty()
        ->and($version)->toBe(JourneyArt::version());
});

it('serves art regardless of the version travelling in the query', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->get(route('api.virtue.mascot', ['set' => 'arbol', 'stage' => 1, 'v' => 'stale']))
        ->assertOk();
});

it('returns 404 for an unknown mascot set', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.mascot', ['set' => 'cat', 'stage' => 1]))
        ->assertNotFound();
});

it('serves the single-frame sets', function (string $set) {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->get(route('api.virtue.mascot', ['set' => $set, 'stage' => 1]))
        ->assertOk();

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.mascot', ['set' => $set, 'stage' => 2]))
        ->assertNotFound();
})->with(['plate', 'knight']);

it('serves the journey art sets and rejects stages beyond each arc', function (string $set) {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->get(route('api.virtue.mascot', ['set' => $set, 'stage' => 1]))
        ->assertOk();

    $this->actingAs($alfonso)
        ->get(route('api.virtue.mascot', ['set' => $set, 'stage' => 30]))
        ->assertOk();

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.mascot', ['set' => $set, 'stage' => 31]))
        ->assertNotFound();
})->with(['tierra', 'cielo', 'arbol', 'arbol-icon']);

it('marks a habit for a day', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.habit', ['date' => $date, 'habit' => 'exercise']), [
            'completed' => true,
        ])
        ->assertOk()
        ->assertJsonPath('data.date', $date)
        ->assertJsonPath('data.habits.exercise', true)
        ->assertJsonPath('data.habits.diet', false)
        ->assertJsonPath('stats.areas.body.points', 1)
        ->assertJsonPath('stats.areas.body.streak', 1);

    expect(VirtueDay::count())->toBe(1)
        ->and(VirtueEntry::count())->toBe(1);
});

it('keeps the first completion when a habit repeats', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $completedAt = now()->subHours(3);
    $entry = VirtueEntry::factory()->create([
        'date' => now()->toDateString(),
        'habit' => 'reading',
        'completed_at' => $completedAt,
    ]);

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.habit', ['date' => $entry->date->toDateString(), 'habit' => 'reading']), [
            'completed' => true,
        ])
        ->assertOk()
        ->assertJsonPath('data.habits.reading', true);

    expect(VirtueEntry::count())->toBe(1)
        ->and(VirtueEntry::first()->completed_at->timestamp)->toBe($completedAt->timestamp);
});

it('clears a habit back to pending', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();
    VirtueEntry::factory()->create(['date' => $date, 'habit' => 'diet']);

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.habit', ['date' => $date, 'habit' => 'diet']), [
            'completed' => false,
        ])
        ->assertOk()
        ->assertJsonPath('data.habits.diet', false)
        ->assertJsonPath('stats.areas.body.points', 0);

    expect(VirtueEntry::count())->toBe(0);
});

it('rejects an unknown habit', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.habit', ['date' => now()->toDateString(), 'habit' => 'juggling']), [
            'completed' => true,
        ])
        ->assertUnprocessable();
});

it('rejects a habit mark too far in the future', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.virtue.days.habit', ['date' => now()->addDays(3)->toDateString(), 'habit' => 'exercise']), [
            'completed' => true,
        ])
        ->assertUnprocessable();
});

it('hides the habits from other family members', function () {
    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)
        ->putJson(route('api.virtue.days.habit', ['date' => now()->toDateString(), 'habit' => 'exercise']), [
            'completed' => true,
        ])
        ->assertForbidden();
});

it('lists the habit marks with the days', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();

    VirtueDay::factory()->create(['date' => $date]);
    VirtueEntry::factory()->create(['date' => $date, 'habit' => 'exercise']);
    VirtueEntry::factory()->create(['date' => $date, 'habit' => 'reading']);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('data.0.habits.exercise', true)
        ->assertJsonPath('data.0.habits.reading', true)
        ->assertJsonPath('data.0.habits.diet', false);
});

it('scores the body area from the exercise and diet habits', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    foreach (range(1, 3) as $offset) {
        VirtueEntry::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'habit' => 'exercise',
        ]);
    }

    VirtueEntry::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'habit' => 'diet',
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.areas.body.points', 4)
        ->assertJsonPath('stats.areas.body.stage', 2)
        ->assertJsonPath('stats.areas.body.streak', 3)
        ->assertJsonPath('stats.areas.mind.points', 0)
        ->assertJsonPath('stats.areas.mind.streak', 0);
});

it('breaks an area streak on a skipped day but keeps the points', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    VirtueEntry::factory()->create([
        'date' => now()->subDays(3)->toDateString(),
        'habit' => 'reading',
    ]);
    VirtueEntry::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'habit' => 'reading',
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.areas.mind.points', 2)
        ->assertJsonPath('stats.areas.mind.streak', 1);
});

it('scores the spirit area from the resolution and the prayers', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    // Two full days (kept + prayed) and one prayers-only day.
    foreach ([2, 3] as $offset) {
        VirtueDay::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'prayers_completed_at' => now()->subDays($offset),
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ]);
    }

    VirtueDay::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'prayers_completed_at' => now()->subDay(),
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.areas.spirit.points', 7)
        ->assertJsonPath('stats.areas.spirit.stage', 2)
        ->assertJsonPath('stats.points', 7);
});

it('floors the spirit points at a crossed checkpoint', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    // Eight kept-and-prayed days (24 points) cross the 22-point checkpoint; the miss lands on the floor.
    foreach (range(2, 9) as $offset) {
        VirtueDay::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'prayers_completed_at' => now()->subDays($offset),
            'resolution' => VirtueDay::RESOLUTION_KEPT,
        ]);
    }

    VirtueDay::factory()->create([
        'date' => now()->subDay()->toDateString(),
        'resolution' => VirtueDay::RESOLUTION_MISSED,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.virtue.days.index'))
        ->assertOk()
        ->assertJsonPath('stats.areas.spirit.points', 22)
        ->assertJsonPath('stats.areas.spirit.stage', 4);
});
