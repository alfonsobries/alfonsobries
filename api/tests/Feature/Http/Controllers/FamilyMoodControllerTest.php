<?php

use App\Models\User;

beforeEach(function () {
    config()->set('site.family.alfonso_apple_id', 'apple-sub-alfonso');
    config()->set('site.family.saida_apple_id', 'apple-sub-saida');
});

it('lists the mood of every family member', function () {
    User::factory()->create(['apple_id' => 'apple-sub-alfonso', 'name' => 'Alfonso', 'mood' => 7]);
    User::factory()->create(['apple_id' => 'apple-sub-saida', 'name' => 'Saida', 'mood' => 3]);
    User::factory()->create(['apple_id' => 'apple-sub-stranger', 'name' => 'Stranger']);

    $me = User::where('apple_id', 'apple-sub-alfonso')->first();

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
    $user = User::factory()->create(['apple_id' => 'apple-sub-alfonso']);

    expect($user->fresh()->mood)->toBe(User::MOOD_NEUTRAL);
});

it('requires authentication to read moods', function () {
    $this->getJson(route('api.moods.index'))->assertUnauthorized();
});

it('lets a family member set their own mood', function () {
    $user = User::factory()->create(['apple_id' => 'apple-sub-alfonso', 'mood' => 5]);

    $this->actingAs($user)
        ->patchJson(route('api.moods.update', ['member' => 'alfonso']), ['mood' => 2])
        ->assertOk()
        ->assertJson(['data' => ['family_member' => 'alfonso', 'mood' => 2]]);

    expect($user->fresh()->mood)->toBe(2);
});

it('lets a family member set another member mood', function () {
    $alfonso = User::factory()->create(['apple_id' => 'apple-sub-alfonso']);
    $saida = User::factory()->create(['apple_id' => 'apple-sub-saida', 'mood' => 5]);

    $this->actingAs($alfonso)
        ->patchJson(route('api.moods.update', ['member' => 'saida']), ['mood' => 8])
        ->assertOk()
        ->assertJson(['data' => ['family_member' => 'saida', 'mood' => 8]]);

    expect($saida->fresh()->mood)->toBe(8);
});

it('rejects a mood outside the 1-9 scale', function () {
    $user = User::factory()->create(['apple_id' => 'apple-sub-alfonso']);

    $this->actingAs($user)
        ->patchJson(route('api.moods.update', ['member' => 'alfonso']), ['mood' => 12])
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('mood');
});

it('returns 404 for an unknown member', function () {
    $user = User::factory()->create(['apple_id' => 'apple-sub-alfonso']);

    $this->actingAs($user)
        ->patchJson(route('api.moods.update', ['member' => 'regina']), ['mood' => 3])
        ->assertNotFound();
});

it('forbids a non family member from setting a mood', function () {
    $user = User::factory()->create(['apple_id' => 'apple-sub-stranger']);

    $this->actingAs($user)
        ->patchJson(route('api.moods.update', ['member' => 'alfonso']), ['mood' => 3])
        ->assertForbidden();
});
