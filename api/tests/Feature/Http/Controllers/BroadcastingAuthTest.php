<?php

use App\Models\User;

it('authorizes a family member on an illustration channel', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.broadcasting.auth'), [
            'channel_name' => 'private-behavior-illustration.1',
            'socket_id' => '123.456',
        ])
        ->assertOk()
        ->assertJsonStructure(['auth']);
});

it('rejects a non family member on an illustration channel', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.broadcasting.auth'), [
            'channel_name' => 'private-behavior-illustration.1',
            'socket_id' => '123.456',
        ])
        ->assertForbidden();
});

it('authorizes alfonso on the private line channel', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.broadcasting.auth'), [
            'channel_name' => 'private-line',
            'socket_id' => '123.456',
        ])
        ->assertOk();
});

it('rejects saida on the private line channel', function () {
    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)
        ->postJson(route('api.broadcasting.auth'), [
            'channel_name' => 'private-line',
            'socket_id' => '123.456',
        ])
        ->assertForbidden();
});

it('requires authentication to authorize a channel', function () {
    $this->postJson(route('api.broadcasting.auth'), [
        'channel_name' => 'private-behavior-illustration.1',
        'socket_id' => '123.456',
    ])->assertUnauthorized();
});
