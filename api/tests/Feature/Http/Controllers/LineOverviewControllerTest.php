<?php

use App\Models\LineCall;
use App\Models\LineMessage;
use App\Models\LineNumber;
use App\Models\LineVoicemail;
use App\Models\User;

it('returns the number and unread counters', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $number = LineNumber::factory()->create(['e164' => '+525500001111', 'display' => '55 0000 1111']);
    LineMessage::factory()->create(['read_at' => null]);
    LineCall::factory()->missed()->create(['seen_at' => null]);
    LineVoicemail::factory()->create(['heard_at' => null]);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.overview'))
        ->assertOk()
        ->assertJsonPath('data.number.e164', $number->e164)
        ->assertJsonPath('data.unread_messages', 1)
        ->assertJsonPath('data.unseen_missed_calls', 1)
        ->assertJsonPath('data.unheard_voicemails', 1);
});
