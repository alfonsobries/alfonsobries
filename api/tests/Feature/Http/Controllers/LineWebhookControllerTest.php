<?php

use App\Jobs\ProcessLineEvent;
use App\Models\LineCall;
use App\Models\LineContact;
use App\Models\LineEvent;
use App\Models\LineMessage;
use App\Models\LineVoicemail;
use App\Models\User;
use App\Notifications\LineIncomingCallNotification;
use App\Notifications\LineMessageNotification;
use App\Notifications\LineMissedCallNotification;
use App\Notifications\LineVoicemailNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    configurePrivacyNumber();
    silenceLineBroadcasts();
});

it('rejects a webhook with an invalid signature', function () {
    Queue::fake();

    postLineWebhook(
        lineEventPayload('evt_1', 'sms.received', ['id' => 'sms_1']),
        ['signature' => 'nope'],
    )->assertForbidden();

    expect(LineEvent::count())->toBe(0);
    Queue::assertNothingPushed();
});

it('rejects a webhook older than five minutes', function () {
    Queue::fake();

    postLineWebhook(
        lineEventPayload('evt_1', 'sms.received', ['id' => 'sms_1']),
        ['timestamp' => now()->subMinutes(6)->getTimestamp()],
    )->assertForbidden();

    expect(LineEvent::count())->toBe(0);
});

it('rejects a webhook when no signing secret is configured', function () {
    config(['services.privacynumber.webhook_secret' => '']);
    Queue::fake();

    postLineWebhook(lineEventPayload('evt_1', 'sms.received', ['id' => 'sms_1']))
        ->assertForbidden();
});

it('stores a signed event and dispatches processing', function () {
    Queue::fake();

    postLineWebhook(lineEventPayload('evt_1', 'sms.received', ['id' => 'sms_1']))
        ->assertOk();

    expect(LineEvent::where('provider_event_id', 'evt_1')->exists())->toBeTrue();
    Queue::assertPushed(ProcessLineEvent::class);
});

it('does not reprocess a replayed event id', function () {
    Queue::fake();

    $payload = lineEventPayload('evt_1', 'sms.received', ['id' => 'sms_1']);

    postLineWebhook($payload)->assertOk();
    postLineWebhook($payload)->assertOk();

    expect(LineEvent::count())->toBe(1);
    Queue::assertPushed(ProcessLineEvent::class, 1);
});

it('records an inbound sms and notifies alfonso', function () {
    Notification::fake();
    User::factory()->create(['family_member' => 'alfonso']);

    postLineWebhook(lineEventPayload('evt_sms', 'sms.received', [
        'id' => 'sms_in_1',
        'from' => '+525511110001',
        'from_e164' => '+525511110001',
        'to' => '+525500000000',
        'body' => 'Your code is 482917',
        'direction' => 'inbound',
        'segments' => 1,
        'status' => 'received',
        'created_at' => now()->toIso8601String(),
    ]))->assertOk();

    $message = LineMessage::first();

    expect($message)->not->toBeNull()
        ->and($message->direction)->toBe(LineMessage::DIRECTION_IN)
        ->and($message->status)->toBe(LineMessage::STATUS_RECEIVED)
        ->and($message->body)->toBe('Your code is 482917')
        ->and($message->toApiPayload()['otp_code'])->toBe('482917');

    Notification::assertSentTo(User::alfonso(), LineMessageNotification::class);
});

it('does not notify for a blocked contact', function () {
    Notification::fake();
    User::factory()->create(['family_member' => 'alfonso']);
    LineContact::factory()->create(['e164' => '+525511110002', 'blocked' => true]);

    postLineWebhook(lineEventPayload('evt_sms_blocked', 'sms.received', [
        'id' => 'sms_blocked',
        'from_e164' => '+525511110002',
        'to' => '+525500000000',
        'body' => 'spam',
        'direction' => 'inbound',
        'created_at' => now()->toIso8601String(),
    ]))->assertOk();

    expect(LineMessage::count())->toBe(1);
    Notification::assertNothingSent();
});

it('notifies on an inbound ringing call', function () {
    Notification::fake();
    User::factory()->create(['family_member' => 'alfonso']);

    postLineWebhook(lineEventPayload('evt_ring', 'call.initiated', [
        'id' => 'call_ring_1',
        'from_e164' => '+525511110003',
        'to' => '+525500000000',
        'direction' => 'inbound',
        'status' => 'ringing',
        'started_at' => now()->toIso8601String(),
    ]))->assertOk();

    expect(LineCall::first()->status)->toBe(LineCall::STATUS_RINGING);
    Notification::assertSentTo(User::alfonso(), LineIncomingCallNotification::class);
});

it('marks an unanswered completed inbound call as missed', function () {
    Notification::fake();
    User::factory()->create(['family_member' => 'alfonso']);

    postLineWebhook(lineEventPayload('evt_missed', 'call.completed', [
        'id' => 'call_miss_1',
        'from_e164' => '+525511110004',
        'to' => '+525500000000',
        'direction' => 'inbound',
        'status' => 'completed',
        'started_at' => now()->subSeconds(20)->toIso8601String(),
        'answered_at' => null,
        'ended_at' => now()->toIso8601String(),
        'duration_sec' => 0,
    ]))->assertOk();

    expect(LineCall::first()->status)->toBe(LineCall::STATUS_MISSED);
    Notification::assertSentTo(User::alfonso(), LineMissedCallNotification::class);
});

it('flags a call answered by the ai screening', function () {
    Notification::fake();
    User::factory()->create(['family_member' => 'alfonso']);

    LineCall::factory()->ringing()->create([
        'provider_id' => 'call_ai_1',
        'line_contact_id' => LineContact::factory()->create(['e164' => '+525511110005'])->id,
    ]);

    postLineWebhook(lineEventPayload('evt_ai', 'ai.pickup', [
        'id' => 'call_ai_1',
        'from_e164' => '+525511110005',
        'to' => '+525500000000',
        'direction' => 'inbound',
        'status' => 'answered',
        'started_at' => now()->toIso8601String(),
        'answered_at' => now()->toIso8601String(),
    ]))->assertOk();

    expect(LineCall::where('provider_id', 'call_ai_1')->first()->answered_by)->toBe('ai');
    Notification::assertNotSentTo(User::alfonso(), LineIncomingCallNotification::class);
});

it('archives voicemail audio and notifies with the transcript', function () {
    Notification::fake();
    Storage::fake('s3');
    Http::preventStrayRequests();
    Http::fake([
        'https://api.privacynumber.io/v1/voicemails/vm_1' => Http::response([
            'id' => 'vm_1',
            'audio_url' => 'https://cdn.example.test/vm.mp3',
        ]),
        'https://cdn.example.test/vm.mp3' => Http::response('audio-bytes', 200, ['Content-Type' => 'audio/mpeg']),
    ]);
    User::factory()->create(['family_member' => 'alfonso']);

    postLineWebhook(lineEventPayload('evt_vm', 'voicemail.created', [
        'id' => 'vm_1',
        'from_e164' => '+525511110006',
        'to' => '+525500000000',
        'direction' => 'inbound',
        'transcript' => 'Call me when you can',
        'created_at' => now()->toIso8601String(),
        'duration_sec' => 12,
    ]))->assertOk();

    $voicemail = LineVoicemail::first();

    expect($voicemail->transcript)->toBe('Call me when you can')
        ->and($voicemail->audio_path)->not->toBeNull();

    Storage::disk('s3')->assertExists($voicemail->audio_path);
    Notification::assertSentTo(User::alfonso(), LineVoicemailNotification::class);
});
