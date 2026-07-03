<?php

use App\Models\User;

beforeEach(function () {
    config()->set('site.family.alfonso_apple_id', 'apple-sub-alfonso');
    config()->set('site.family.saida_apple_id', 'apple-sub-saida');
});

it('recognizes Alfonso by his apple sub', function () {
    $user = User::factory()->make(['apple_id' => 'apple-sub-alfonso']);

    expect($user->isAlfonso())->toBeTrue();
    expect($user->isSaida())->toBeFalse();
    expect($user->isFamilyMember())->toBeTrue();
});

it('recognizes Saida by her apple sub', function () {
    $user = User::factory()->make(['apple_id' => 'apple-sub-saida']);

    expect($user->isSaida())->toBeTrue();
    expect($user->isAlfonso())->toBeFalse();
    expect($user->isFamilyMember())->toBeTrue();
});

it('treats an unknown apple sub as not a family member', function () {
    $user = User::factory()->make(['apple_id' => 'apple-sub-stranger']);

    expect($user->isFamilyMember())->toBeFalse();
});

it('never matches when the apple sub is null', function () {
    config()->set('site.family.alfonso_apple_id', null);
    $user = User::factory()->make(['apple_id' => null]);

    expect($user->isAlfonso())->toBeFalse();
    expect($user->isFamilyMember())->toBeFalse();
});

it('exposes the family member as a serialized attribute', function () {
    expect(User::factory()->make(['apple_id' => 'apple-sub-alfonso'])->toArray())
        ->toHaveKey('family_member', 'alfonso');
    expect(User::factory()->make(['apple_id' => 'apple-sub-saida'])->toArray())
        ->toHaveKey('family_member', 'saida');
    expect(User::factory()->make(['apple_id' => 'apple-sub-stranger'])->toArray())
        ->toHaveKey('family_member', null);
});
