<?php

use App\Models\LineMessage;
use App\Models\LineNumber;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    configurePrivacyNumber();
    silenceLineBroadcasts();
    Http::preventStrayRequests();
});

it('sends an sms through the provider and stores the local copy', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    LineNumber::factory()->create(['provider_id' => 'num_test']);

    Http::fake([
        'https://api.privacynumber.io/v1/sms' => Http::response([
            'id' => 'sms_out_1',
            'segments' => 1,
            'cost_usd' => 0.012,
            'status' => 'sent',
        ]),
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.line.messages.store'), [
            'to' => '+525511119999',
            'body' => 'Estoy en camino',
            'client_key' => '9b3d4a7c-1111-4111-8111-aaaaaaaaaaaa',
        ])
        ->assertCreated()
        ->assertJsonPath('data.status', LineMessage::STATUS_SENT)
        ->assertJsonPath('data.body', 'Estoy en camino')
        ->assertJsonPath('data.direction', LineMessage::DIRECTION_OUT);

    expect(LineMessage::count())->toBe(1);

    Http::assertSent(fn ($request): bool => $request->hasHeader('Idempotency-Key', '9b3d4a7c-1111-4111-8111-aaaaaaaaaaaa')
        && $request->hasHeader('PrivacyNumber-Version', '2026-04-01'));
});

it('replays the same client key without sending twice', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    LineNumber::factory()->create();

    Http::fake([
        'https://api.privacynumber.io/v1/sms' => Http::response([
            'id' => 'sms_out_2',
            'segments' => 1,
            'status' => 'sent',
        ]),
    ]);

    $payload = [
        'to' => '+525511119998',
        'body' => 'hola',
        'client_key' => '9b3d4a7c-2222-4222-8222-bbbbbbbbbbbb',
    ];

    $this->actingAs($alfonso)->postJson(route('api.line.messages.store'), $payload)->assertCreated();
    $this->actingAs($alfonso)->postJson(route('api.line.messages.store'), $payload)->assertOk();

    expect(LineMessage::count())->toBe(1);
    Http::assertSentCount(1);
});

it('keeps a failed outbound message so the thread can retry', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    LineNumber::factory()->create();

    Http::fake([
        'https://api.privacynumber.io/v1/sms' => Http::response([
            'error' => [
                'type' => 'invalid_request_error',
                'code' => 'parameter_invalid',
                'message' => 'bad to',
            ],
        ], 422),
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.line.messages.store'), [
            'to' => '+525511119997',
            'body' => 'hola',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('data.status', LineMessage::STATUS_FAILED);

    expect(LineMessage::first()->failure_code)->toBe('parameter_invalid');
});

it('rejects an unconfigured line', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    Http::fake([
        'https://api.privacynumber.io/v1/numbers' => Http::response(['data' => []]),
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.line.messages.store'), [
            'to' => '+525511119996',
            'body' => 'hola',
        ])
        ->assertUnprocessable();
});
