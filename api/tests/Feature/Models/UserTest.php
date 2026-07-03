<?php

use App\Models\User;

beforeEach(function () {
    config()->set('site.family.alfonso_apple_id', 'apple-sub-alfonso');
    config()->set('site.family.saida_apple_id', 'apple-sub-saida');
});

it('recognizes each family member from the family_member column', function () {
    expect(User::factory()->make(['family_member' => 'alfonso'])->isAlfonso())->toBeTrue();
    expect(User::factory()->make(['family_member' => 'saida'])->isSaida())->toBeTrue();
    expect(User::factory()->make(['family_member' => 'regina'])->isRegina())->toBeTrue();
    expect(User::factory()->make(['family_member' => 'andres'])->isAndres())->toBeTrue();
});

it('treats anyone without a family_member as not family', function () {
    $user = User::factory()->make(['family_member' => null]);

    expect($user->isFamilyMember())->toBeFalse();
    expect($user->isAlfonso())->toBeFalse();
});

it('only gives the parents a mood', function () {
    expect(User::factory()->make(['family_member' => 'alfonso'])->hasMood())->toBeTrue();
    expect(User::factory()->make(['family_member' => 'saida'])->hasMood())->toBeTrue();
    expect(User::factory()->make(['family_member' => 'regina'])->hasMood())->toBeFalse();
    expect(User::factory()->make(['family_member' => null])->hasMood())->toBeFalse();
});

it('maps an Apple sub to the right family member', function () {
    expect(User::familyMemberForAppleId('apple-sub-alfonso'))->toBe('alfonso');
    expect(User::familyMemberForAppleId('apple-sub-saida'))->toBe('saida');
    expect(User::familyMemberForAppleId('apple-sub-stranger'))->toBeNull();
    expect(User::familyMemberForAppleId(null))->toBeNull();
});

it('serializes the family_member', function () {
    expect(User::factory()->make(['family_member' => 'alfonso'])->toArray())
        ->toHaveKey('family_member', 'alfonso');
    expect(User::factory()->make(['family_member' => null])->toArray())
        ->toHaveKey('family_member', null);
});
