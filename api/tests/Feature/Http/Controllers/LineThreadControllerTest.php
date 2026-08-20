<?php

use App\Models\LineCall;
use App\Models\LineContact;
use App\Models\LineMessage;
use App\Models\User;

it('lists threads newest first with unread counts', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $older = LineContact::factory()->create(['name' => 'Banco']);
    $newer = LineContact::factory()->create(['name' => 'Escuela']);

    LineMessage::factory()->create([
        'line_contact_id' => $older->id,
        'body' => 'Saldo bajo',
        'provider_created_at' => now()->subHour(),
        'read_at' => now(),
    ]);
    LineMessage::factory()->create([
        'line_contact_id' => $newer->id,
        'body' => 'Junta a las 9',
        'provider_created_at' => now(),
        'read_at' => null,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.threads.index'))
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Escuela')
        ->assertJsonPath('data.0.unread_count', 1)
        ->assertJsonPath('data.1.name', 'Banco')
        ->assertJsonPath('data.1.unread_count', 0);
});

it('includes contacts that only have calls', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $contact = LineContact::factory()->create(['name' => 'Doctor']);
    LineCall::factory()->missed()->create(['line_contact_id' => $contact->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.threads.index'))
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Doctor')
        ->assertJsonPath('data.0.last_call.status', LineCall::STATUS_MISSED);
});

it('searches contacts and message bodies', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $match = LineContact::factory()->create(['name' => 'SAT']);
    $other = LineContact::factory()->create(['name' => 'Vecino']);

    LineMessage::factory()->create(['line_contact_id' => $match->id, 'body' => 'Tu RFC está listo']);
    LineMessage::factory()->create(['line_contact_id' => $other->id, 'body' => 'hola']);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.threads.index', ['q' => 'RFC']))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'SAT');
});

it('marks inbound messages read when opening a thread', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $contact = LineContact::factory()->create();
    $unread = LineMessage::factory()->create([
        'line_contact_id' => $contact->id,
        'read_at' => null,
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.threads.show', $contact))
        ->assertOk()
        ->assertJsonPath('data.contact.id', $contact->id);

    expect($unread->fresh()->read_at)->not->toBeNull();
});
