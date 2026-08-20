<?php

use App\Models\LineCall;
use App\Models\LineContact;
use App\Models\LineNumber;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    configurePrivacyNumber();
    silenceLineBroadcasts();
});

it('lists calls with their contact', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $contact = LineContact::factory()->create(['name' => 'Mamá']);
    LineCall::factory()->missed()->create(['line_contact_id' => $contact->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.calls.index'))
        ->assertOk()
        ->assertJsonPath('data.0.contact.name', 'Mamá')
        ->assertJsonPath('data.0.status', LineCall::STATUS_MISSED);
});

it('places an outbound call', function () {
    Http::preventStrayRequests();
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    LineNumber::factory()->create(['provider_id' => 'num_test', 'e164' => '+525500000000']);

    Http::fake([
        'https://api.privacynumber.io/v1/calls' => Http::response([
            'id' => 'call_out_1',
            'status' => 'ringing',
            'direction' => 'outbound',
        ]),
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.line.calls.store'), [
            'to' => '+525511118888',
            'callerid_mask' => 'own',
        ])
        ->assertCreated()
        ->assertJsonPath('data.status', LineCall::STATUS_RINGING)
        ->assertJsonPath('data.direction', LineCall::DIRECTION_OUT);
});

it('hangs up a ringing call and marks inbound as missed', function () {
    Http::preventStrayRequests();
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $call = LineCall::factory()->ringing()->create();

    Http::fake([
        "https://api.privacynumber.io/v1/calls/{$call->provider_id}/hangup" => Http::response(['id' => $call->provider_id]),
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.line.calls.hangup', $call))
        ->assertOk()
        ->assertJsonPath('data.status', LineCall::STATUS_MISSED);

    expect($call->fresh()->ended_at)->not->toBeNull();
});

it('clears unseen missed calls', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    LineCall::factory()->missed()->create(['seen_at' => null]);

    $this->actingAs($alfonso)
        ->postJson(route('api.line.calls.seen'))
        ->assertOk();

    expect(LineCall::whereNull('seen_at')->count())->toBe(0);
});
