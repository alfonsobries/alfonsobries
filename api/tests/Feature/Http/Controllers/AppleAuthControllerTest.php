<?php

use App\Models\User;
use App\Services\Apple\AppleTokenVerifier;
use App\Services\Apple\AppleVerifiedUser;
use App\Services\Apple\InvalidAppleTokenException;

function fakeAppleVerifier(AppleVerifiedUser $user): void
{
    test()->instance(AppleTokenVerifier::class, new class($user) extends AppleTokenVerifier
    {
        public function __construct(private readonly AppleVerifiedUser $user) {}

        public function verify(string $identityToken): AppleVerifiedUser
        {
            return $this->user;
        }
    });
}

it('creates a new user and returns a bearer token', function () {
    fakeAppleVerifier(new AppleVerifiedUser('apple-sub-123', 'me@example.com', false));

    $response = $this->postJson(route('api.auth.apple'), [
        'id_token' => 'signed.jwt.token',
        'name' => 'Alfonso',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['token', 'token_type', 'user' => ['id', 'name', 'email']])
        ->assertJson([
            'token_type' => 'Bearer',
            'user' => ['name' => 'Alfonso', 'email' => 'me@example.com'],
        ]);

    $this->assertDatabaseHas('users', [
        'apple_id' => 'apple-sub-123',
        'email' => 'me@example.com',
    ]);
});

it('signs an existing apple user back in without duplicating', function () {
    $user = User::factory()->create(['apple_id' => 'apple-sub-123', 'name' => 'Alfonso']);

    fakeAppleVerifier(new AppleVerifiedUser('apple-sub-123', 'me@example.com', false));

    $response = $this->postJson(route('api.auth.apple'), ['id_token' => 'signed.jwt.token']);

    $response->assertOk();
    expect(User::where('apple_id', 'apple-sub-123')->count())->toBe(1);
});

it('links apple to an existing account with the same email', function () {
    $user = User::factory()->create(['email' => 'me@example.com', 'apple_id' => null]);

    fakeAppleVerifier(new AppleVerifiedUser('apple-sub-123', 'me@example.com', false));

    $this->postJson(route('api.auth.apple'), ['id_token' => 'signed.jwt.token'])->assertOk();

    $this->assertDatabaseHas('users', ['id' => $user->id, 'apple_id' => 'apple-sub-123']);
});

it('rejects an invalid apple token', function () {
    $this->instance(AppleTokenVerifier::class, new class extends AppleTokenVerifier
    {
        public function verify(string $identityToken): AppleVerifiedUser
        {
            throw new InvalidAppleTokenException('Invalid Apple identity token.', 401);
        }
    });

    $this->postJson(route('api.auth.apple'), ['id_token' => 'bad'])
        ->assertStatus(401)
        ->assertJson(['message' => 'Invalid Apple identity token.']);
});

it('validates that the id token is required', function () {
    $this->postJson(route('api.auth.apple'), [])
        ->assertStatus(422)
        ->assertJsonValidationErrors('id_token');
});

it('logs out by revoking the current token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('apple')->plainTextToken;

    $this->withToken($token)
        ->postJson(route('api.auth.logout'))
        ->assertOk();

    expect($user->tokens()->count())->toBe(0);
});
