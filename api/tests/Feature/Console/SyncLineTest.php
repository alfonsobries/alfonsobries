<?php

use App\Models\LineMessage;
use App\Models\User;
use App\Notifications\LineMessageNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;

it('mirrors a provider sms that never arrived by webhook without notifying', function () {
    configurePrivacyNumber();
    silenceLineBroadcasts();
    Notification::fake();
    User::factory()->create(['family_member' => 'alfonso']);
    Http::preventStrayRequests();
    Http::fake([
        'https://api.privacynumber.io/v1/sms*' => Http::response(['data' => [[
            'id' => 'sms_sync_1',
            'from_e164' => '+525511110777',
            'to' => '+525500000000',
            'body' => 'late webhook',
            'direction' => 'inbound',
            'status' => 'received',
            'created_at' => now()->toIso8601String(),
        ]]]),
        'https://api.privacynumber.io/v1/calls*' => Http::response(['data' => []]),
        'https://api.privacynumber.io/v1/voicemails*' => Http::response(['data' => []]),
    ]);

    $this->artisan('line:sync')->assertSuccessful();

    expect(LineMessage::where('provider_id', 'sms_sync_1')->exists())->toBeTrue();
    Notification::assertNothingSent();
});

it('does not re-notify an sms that already exists', function () {
    configurePrivacyNumber();
    silenceLineBroadcasts();
    Notification::fake();
    User::factory()->create(['family_member' => 'alfonso']);
    LineMessage::factory()->create(['provider_id' => 'sms_sync_1', 'body' => 'already here']);
    Http::preventStrayRequests();
    Http::fake([
        'https://api.privacynumber.io/v1/sms*' => Http::response(['data' => [[
            'id' => 'sms_sync_1',
            'from_e164' => '+525511110777',
            'to' => '+525500000000',
            'body' => 'already here',
            'direction' => 'inbound',
            'status' => 'received',
            'created_at' => now()->toIso8601String(),
        ]]]),
        'https://api.privacynumber.io/v1/calls*' => Http::response(['data' => []]),
        'https://api.privacynumber.io/v1/voicemails*' => Http::response(['data' => []]),
    ]);

    $this->artisan('line:sync')->assertSuccessful();

    expect(LineMessage::where('provider_id', 'sms_sync_1')->count())->toBe(1);
    Notification::assertNotSentTo(User::alfonso(), LineMessageNotification::class);
});
