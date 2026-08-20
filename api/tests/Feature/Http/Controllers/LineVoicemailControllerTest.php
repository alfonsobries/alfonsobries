<?php

use App\Models\LineVoicemail;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

it('lists voicemails with their contact', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    LineVoicemail::factory()->create(['transcript' => 'Te llamo más tarde']);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.voicemails.index'))
        ->assertOk()
        ->assertJsonPath('data.0.transcript', 'Te llamo más tarde');
});

it('returns a signed url for archived audio', function () {
    Storage::fake('s3');
    Storage::disk('s3')->buildTemporaryUrlsUsing(
        fn (string $path, DateTimeInterface $expiration): string => "https://s3.test/{$path}",
    );

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $voicemail = LineVoicemail::factory()->create(['audio_path' => 'line/voicemails/1.mp3']);
    Storage::disk('s3')->put($voicemail->audio_path, 'audio');

    $this->actingAs($alfonso)
        ->getJson(route('api.line.voicemails.audio', $voicemail))
        ->assertOk()
        ->assertJsonPath('data.url', 'https://s3.test/line/voicemails/1.mp3');
});

it('returns 404 while audio is still being archived', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $voicemail = LineVoicemail::factory()->create(['audio_path' => null]);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.voicemails.audio', $voicemail))
        ->assertNotFound();
});

it('deletes a voicemail at the provider and locally', function () {
    configurePrivacyNumber();
    Http::preventStrayRequests();
    Storage::fake('s3');
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $voicemail = LineVoicemail::factory()->create([
        'provider_id' => 'vm_del',
        'audio_path' => 'line/voicemails/9.mp3',
    ]);
    Storage::disk('s3')->put($voicemail->audio_path, 'audio');

    Http::fake([
        "https://api.privacynumber.io/v1/voicemails/{$voicemail->provider_id}" => Http::response(null, 204),
    ]);

    $this->actingAs($alfonso)
        ->deleteJson(route('api.line.voicemails.destroy', $voicemail))
        ->assertOk();

    expect(LineVoicemail::find($voicemail->id))->toBeNull();
});

it('marks a voicemail as heard', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $voicemail = LineVoicemail::factory()->create(['heard_at' => null]);

    $this->actingAs($alfonso)
        ->postJson(route('api.line.voicemails.heard', $voicemail))
        ->assertOk();

    expect($voicemail->fresh()->heard_at)->not->toBeNull();
});
