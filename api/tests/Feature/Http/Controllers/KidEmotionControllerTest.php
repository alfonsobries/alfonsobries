<?php

use App\Models\User;

it('lists the current emotions of the children', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    User::factory()->create(['family_member' => 'regina', 'name' => 'Regina', 'emotion' => 'happy']);
    User::factory()->create(['family_member' => 'andres', 'name' => 'Andrés']);
    User::factory()->create(['family_member' => null, 'name' => 'Stranger']);

    $this->actingAs($alfonso)
        ->getJson(route('api.kid-emotions.index'))
        ->assertOk()
        ->assertJson([
            'data' => [
                ['family_member' => 'regina', 'name' => 'Regina', 'emotion' => 'happy'],
                ['family_member' => 'andres', 'name' => 'Andrés', 'emotion' => null],
            ],
        ])
        ->assertJsonCount(2, 'data');
});

it('lets a family member set a child emotion', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $regina = User::factory()->create(['family_member' => 'regina']);

    $this->actingAs($alfonso)
        ->patchJson(route('api.kid-emotions.update', ['member' => 'regina']), ['emotion' => 'proud'])
        ->assertOk()
        ->assertJson(['data' => ['family_member' => 'regina', 'emotion' => 'proud']]);

    expect($regina->fresh()->emotion->value)->toBe('proud');
});

it('rejects an unknown emotion', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    User::factory()->create(['family_member' => 'andres']);

    $this->actingAs($alfonso)
        ->patchJson(route('api.kid-emotions.update', ['member' => 'andres']), ['emotion' => 'sleepy'])
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('emotion');
});

it('will not set an emotion for a parent', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->patchJson(route('api.kid-emotions.update', ['member' => 'alfonso']), ['emotion' => 'happy'])
        ->assertNotFound();
});

it('requires a family account to read or set emotions', function () {
    $outsider = User::factory()->create(['family_member' => null]);
    User::factory()->create(['family_member' => 'regina']);

    $this->actingAs($outsider)
        ->getJson(route('api.kid-emotions.index'))
        ->assertForbidden();

    $this->actingAs($outsider)
        ->patchJson(route('api.kid-emotions.update', ['member' => 'regina']), ['emotion' => 'happy'])
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->getJson(route('api.kid-emotions.index'))->assertUnauthorized();
});
