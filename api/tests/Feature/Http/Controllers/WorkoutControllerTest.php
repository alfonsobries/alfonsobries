<?php

use App\Models\User;
use App\Models\WorkoutEntry;
use App\Workout\DailyRoutine;

it('serves the plan with an empty day', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->getJson(route('api.workout.index'))
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('sets_total', DailyRoutine::totalSets())
        ->assertJsonPath('plan.0.key', 'pull_ups')
        ->assertJsonPath('plan.0.sets', 3)
        ->assertJsonPath('plan.0.target', 10)
        ->assertJsonPath('plan.0.unit', 'reps')
        ->assertJsonPath('plan.3.key', 'deep_squat')
        ->assertJsonPath('plan.3.sets', 5)
        ->assertJsonPath('plan.3.unit', 'seconds')
        ->assertJsonPath('stats.streak', 0)
        ->assertJsonPath('stats.total_days', 0);
});

it('records the sets of an exercise', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();

    $this->actingAs($alfonso)
        ->putJson(route('api.workout.update', ['date' => $date, 'exercise' => 'pull_ups']), ['sets' => 2])
        ->assertOk()
        ->assertJsonPath('data.date', $date)
        ->assertJsonPath('data.exercises.pull_ups', 2)
        ->assertJsonPath('data.exercises.push_ups', 0)
        ->assertJsonPath('data.sets_done', 2)
        ->assertJsonPath('data.points', DailyRoutine::PARTIAL_POINTS)
        ->assertJsonPath('stats.streak', 1);

    expect(WorkoutEntry::count())->toBe(1);
});

it('replaces the count rather than adding to it', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();

    foreach ([3, 1] as $sets) {
        $this->actingAs($alfonso)
            ->putJson(route('api.workout.update', ['date' => $date, 'exercise' => 'push_ups']), ['sets' => $sets])
            ->assertOk();
    }

    $this->actingAs($alfonso)
        ->getJson(route('api.workout.index'))
        ->assertOk()
        ->assertJsonPath('data.0.exercises.push_ups', 1);

    expect(WorkoutEntry::count())->toBe(1);
});

it('clears an exercise back to pending', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();
    WorkoutEntry::factory()->create(['date' => $date, 'exercise' => 'air_squats', 'sets' => 2]);

    $this->actingAs($alfonso)
        ->putJson(route('api.workout.update', ['date' => $date, 'exercise' => 'air_squats']), ['sets' => 0])
        ->assertOk()
        ->assertJsonPath('data.exercises.air_squats', 0)
        ->assertJsonPath('data.points', 0);

    expect(WorkoutEntry::count())->toBe(0);
});

it('keeps the first completion when an exercise is edited again', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $completedAt = now()->subHours(3);
    $entry = WorkoutEntry::factory()->create([
        'date' => now()->toDateString(),
        'exercise' => 'pull_ups',
        'sets' => 1,
        'completed_at' => $completedAt,
    ]);

    $this->actingAs($alfonso)
        ->putJson(route('api.workout.update', ['date' => now()->toDateString(), 'exercise' => 'pull_ups']), ['sets' => 3])
        ->assertOk();

    expect($entry->fresh()->completed_at->timestamp)->toBe($completedAt->timestamp);
});

it('scores the whole routine at three points', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $date = now()->toDateString();

    foreach (['pull_ups' => 3, 'push_ups' => 3, 'air_squats' => 3, 'deep_squat' => 5] as $exercise => $sets) {
        $this->actingAs($alfonso)
            ->putJson(route('api.workout.update', ['date' => $date, 'exercise' => $exercise]), ['sets' => $sets])
            ->assertOk();
    }

    $this->actingAs($alfonso)
        ->getJson(route('api.workout.index'))
        ->assertOk()
        ->assertJsonPath('data.0.sets_done', DailyRoutine::totalSets())
        ->assertJsonPath('data.0.points', DailyRoutine::FULL_POINTS)
        ->assertJsonPath('stats.full_days', 1);
});

it('rejects more sets than the exercise asks for', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.workout.update', ['date' => now()->toDateString(), 'exercise' => 'pull_ups']), ['sets' => 4])
        ->assertUnprocessable();
});

it('rejects an unknown exercise', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.workout.update', ['date' => now()->toDateString(), 'exercise' => 'burpees']), ['sets' => 1])
        ->assertUnprocessable();
});

it('rejects a workout mark too far in the future', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.workout.update', ['date' => now()->addDays(3)->toDateString(), 'exercise' => 'pull_ups']), ['sets' => 1])
        ->assertUnprocessable();
});

it('fills in a past day', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $yesterday = now()->subDay()->toDateString();

    $this->actingAs($alfonso)
        ->putJson(route('api.workout.update', ['date' => $yesterday, 'exercise' => 'deep_squat']), ['sets' => 5])
        ->assertOk()
        ->assertJsonPath('data.date', $yesterday)
        ->assertJsonPath('data.exercises.deep_squat', 5);
});

it('counts consecutive days as a streak and leaves today pending', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    foreach (range(1, 3) as $offset) {
        WorkoutEntry::factory()->create([
            'date' => now()->subDays($offset)->toDateString(),
            'exercise' => 'pull_ups',
            'sets' => 1,
        ]);
    }

    $this->actingAs($alfonso)
        ->getJson(route('api.workout.index'))
        ->assertOk()
        ->assertJsonPath('stats.streak', 3)
        ->assertJsonPath('stats.total_days', 3)
        ->assertJsonPath('stats.full_days', 0);
});

it('leaves out days beyond the window', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    WorkoutEntry::factory()->create([
        'date' => now()->subDays(90)->toDateString(),
        'exercise' => 'pull_ups',
        'sets' => 3,
    ]);
    WorkoutEntry::factory()->create([
        'date' => now()->toDateString(),
        'exercise' => 'pull_ups',
        'sets' => 3,
    ]);

    // The old day still counts toward the totals; it just isn't shipped.
    $this->actingAs($alfonso)
        ->getJson(route('api.workout.index'))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('stats.total_days', 2);
});

it('is not available to other family members', function () {
    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)
        ->getJson(route('api.workout.index'))
        ->assertForbidden();

    $this->actingAs($saida)
        ->putJson(route('api.workout.update', ['date' => now()->toDateString(), 'exercise' => 'pull_ups']), ['sets' => 1])
        ->assertForbidden();
});

it('requires authentication for the workout', function () {
    $this->getJson(route('api.workout.index'))->assertUnauthorized();
});
