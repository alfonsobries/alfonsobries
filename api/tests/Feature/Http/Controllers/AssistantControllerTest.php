<?php

use App\Models\Assistant;
use App\Models\User;

it('lists the assistants available to the signed-in member', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    Assistant::factory()->create(['name' => 'Shared', 'members' => ['alfonso', 'saida'], 'sort_order' => 1]);
    Assistant::factory()->create(['name' => 'Mine', 'members' => ['alfonso'], 'sort_order' => 0]);
    Assistant::factory()->create(['name' => 'Hers', 'members' => ['saida']]);
    Assistant::factory()->create(['name' => 'Retired', 'members' => ['alfonso'], 'is_active' => false]);

    $this->actingAs($alfonso)
        ->getJson(route('api.assistants.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.name', 'Mine')
        ->assertJsonPath('data.1.name', 'Shared');
});

it('includes the presentation hints the app renders with', function () {
    $saida = User::factory()->create(['family_member' => 'saida']);

    Assistant::factory()->create([
        'name' => 'Translator',
        'emoji' => '🌐',
        'members' => ['saida'],
        'copyable_output' => true,
    ]);

    $this->actingAs($saida)
        ->getJson(route('api.assistants.index'))
        ->assertOk()
        ->assertJsonPath('data.0.emoji', '🌐')
        ->assertJsonPath('data.0.copyable_output', true);
});

it('forbids a non family member from listing assistants', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->getJson(route('api.assistants.index'))
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->getJson(route('api.assistants.index'))->assertUnauthorized();
});
