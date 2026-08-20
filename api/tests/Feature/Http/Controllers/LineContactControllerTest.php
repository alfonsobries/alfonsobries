<?php

use App\Models\LineContact;
use App\Models\User;

it('updates a contact name and block flag', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $contact = LineContact::factory()->create(['name' => null, 'blocked' => false]);

    $this->actingAs($alfonso)
        ->patchJson(route('api.line.contacts.update', $contact), [
            'name' => 'Doctora Ruiz',
            'blocked' => true,
            'favorite' => true,
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Doctora Ruiz')
        ->assertJsonPath('data.blocked', true)
        ->assertJsonPath('data.favorite', true);
});
