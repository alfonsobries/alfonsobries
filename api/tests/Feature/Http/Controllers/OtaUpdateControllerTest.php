<?php

use App\Models\User;
use App\Notifications\OtaUpdateNotification;
use Illuminate\Support\Facades\Notification;

function signedOtaHeaders(array $payload): array
{
    return [
        'X-Ota-Signature' => hash_hmac('sha256', json_encode($payload), 'test-secret'),
        'Content-Type' => 'application/json',
    ];
}

beforeEach(function () {
    config()->set('services.eas.notify_secret', 'test-secret');
});

it('notifies the publisher devices when an update is published', function () {
    Notification::fake();

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $saida = User::factory()->create(['family_member' => 'saida']);
    $alfonso->deviceTokens()->create([
        'expo_token' => 'ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]',
        'platform' => 'ios',
    ]);
    $saida->deviceTokens()->create([
        'expo_token' => 'ExponentPushToken[bbbbbbbbbbbbbbbbbbbbbb]',
        'platform' => 'ios',
    ]);

    $payload = ['message' => 'Production release', 'channel' => 'production'];

    $this->call(
        'POST',
        route('api.ota.published'),
        [],
        [],
        [],
        $this->transformHeadersToServerVars(signedOtaHeaders($payload)),
        json_encode($payload),
    )->assertOk()->assertJsonPath('devices', 1);

    Notification::assertSentTo($alfonso, OtaUpdateNotification::class);
    Notification::assertNotSentTo($saida, OtaUpdateNotification::class);
});

it('rejects a bad signature', function () {
    Notification::fake();

    $payload = ['message' => 'Production release'];

    $this->postJson(route('api.ota.published'), $payload, [
        'X-Ota-Signature' => 'nope',
    ])->assertForbidden();

    Notification::assertNothingSent();
});

it('rejects the webhook when no secret is configured', function () {
    config()->set('services.eas.notify_secret', '');

    $this->postJson(route('api.ota.published'), ['message' => 'x'], [
        'X-Ota-Signature' => hash_hmac('sha256', '{"message":"x"}', ''),
    ])->assertForbidden();
});
