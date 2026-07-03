<?php

use App\Models\User;

beforeEach(function () {
    config()->set('site.family', [
        ['key' => 'alfonso', 'name' => 'Alfonso', 'apple_id' => 'apple-sub-alfonso'],
        ['key' => 'saida', 'name' => 'Saida', 'apple_id' => 'apple-sub-saida'],
    ]);
});

it('resolves the family key from the apple sub', function () {
    $user = User::factory()->make(['apple_id' => 'apple-sub-saida']);

    expect($user->family_key)->toBe('saida');
    expect($user->isFamilyMember())->toBeTrue();
});

it('has no family key for an unknown apple sub', function () {
    $user = User::factory()->make(['apple_id' => 'apple-sub-stranger']);

    expect($user->family_key)->toBeNull();
    expect($user->isFamilyMember())->toBeFalse();
});

it('has no family key without an apple sub', function () {
    $user = User::factory()->make(['apple_id' => null]);

    expect($user->family_key)->toBeNull();
    expect($user->isFamilyMember())->toBeFalse();
});
