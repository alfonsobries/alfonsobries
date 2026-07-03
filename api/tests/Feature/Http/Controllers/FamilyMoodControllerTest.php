<?php

use App\Models\User;

it('lists the mood of the parents only', function () {
    User::factory()->create(['family_member' => 'alfonso', 'name' => 'Alfonso', 'mood' => 7]);
    User::factory()->create(['family_member' => 'saida', 'name' => 'Saida', 'mood' => 3]);
    User::factory()->create(['family_member' => 'regina', 'name' => 'Regina']);
    User::factory()->create(['family_member' => null, 'name' => 'Stranger']);

    $me = User::where('family_member', 'alfonso')->first();

    $this->actingAs($me)
        ->getJson(route('api.moods.index'))
        ->assertOk()
        ->assertJson([
            'data' => [
                ['family_member' => 'alfonso', 'name' => 'Alfonso', 'mood' => 7],
                ['family_member' => 'saida', 'name' => 'Saida', 'mood' => 3],
            ],
        ])
        ->assertJsonCount(2, 'data');
});

it('defaults a new family member to the neutral mood', function () {
    $user = User::factory()->create(['family_member' => 'alfonso']);

    expect($user->fresh()->mood)->toBe(User::MOOD_NEUTRAL);
});

it('requires authentication to read moods', function () {
    $this->getJson(route('api.moods.index'))->assertUnauthorized();
});

it('lets a family member set their own mood', function () {
    $user = User::factory()->create(['family_member' => 'alfonso', 'mood' => 5]);

    $this->actingAs($user)
        ->patchJson(route('api.moods.update', ['member' => 'alfonso']), ['mood' => 2])
        ->assertOk()
        ->assertJson(['data' => ['family_member' => 'alfonso', 'mood' => 2]]);

    expect($user->fresh()->mood)->toBe(2);
});

it('lets a family member set another member mood', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $saida = User::factory()->create(['family_member' => 'saida', 'mood' => 5]);

    $this->actingAs($alfonso)
        ->patchJson(route('api.moods.update', ['member' => 'saida']), ['mood' => 8])
        ->assertOk()
        ->assertJson(['data' => ['family_member' => 'saida', 'mood' => 8]]);

    expect($saida->fresh()->mood)->toBe(8);
});

it('rejects a mood outside the 1-9 scale', function () {
    $user = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($user)
        ->patchJson(route('api.moods.update', ['member' => 'alfonso']), ['mood' => 12])
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('mood');
});

it('will not set a mood for a kid, who has none', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    User::factory()->create(['family_member' => 'regina']);

    $this->actingAs($alfonso)
        ->patchJson(route('api.moods.update', ['member' => 'regina']), ['mood' => 3])
        ->assertNotFound();
});

it('returns 404 for an unknown member', function () {
    $user = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($user)
        ->patchJson(route('api.moods.update', ['member' => 'nobody']), ['mood' => 3])
        ->assertNotFound();
});

it('forbids a non family member from setting a mood', function () {
    $user = User::factory()->create(['family_member' => null]);

    $this->actingAs($user)
        ->patchJson(route('api.moods.update', ['member' => 'alfonso']), ['mood' => 3])
        ->assertForbidden();
});
