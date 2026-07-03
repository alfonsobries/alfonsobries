<?php

use App\Models\DeviceToken;
use App\Models\User;

$validToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

it('registers a push token for the signed-in user', function () use ($validToken) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('api.push-tokens.store'), ['token' => $validToken, 'platform' => 'ios'])
        ->assertCreated()
        ->assertJson(['data' => ['expo_token' => $validToken]]);

    $this->assertDatabaseHas('device_tokens', [
        'user_id' => $user->id,
        'expo_token' => $validToken,
        'platform' => 'ios',
    ]);
});

it('refreshes the same token instead of duplicating it', function () use ($validToken) {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('api.push-tokens.store'), ['token' => $validToken]);
    $this->actingAs($user)->postJson(route('api.push-tokens.store'), ['token' => $validToken]);

    expect(DeviceToken::where('expo_token', $validToken)->count())->toBe(1);
});

it('rejects a malformed push token', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('api.push-tokens.store'), ['token' => 'not-a-real-token'])
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('token');
});

it('requires authentication to register a token', function () use ($validToken) {
    $this->postJson(route('api.push-tokens.store'), ['token' => $validToken])->assertUnauthorized();
});
