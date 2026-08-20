<?php

use App\Models\User;

it('forbids saida and the kids from every line endpoint', function (string $member) {
    $user = User::factory()->create(['family_member' => $member]);

    $this->actingAs($user)->getJson(route('api.line.overview'))->assertForbidden();
    $this->actingAs($user)->getJson(route('api.line.threads.index'))->assertForbidden();
    $this->actingAs($user)->postJson(route('api.line.messages.store'), [
        'to' => '+525511110000',
        'body' => 'hola',
    ])->assertForbidden();
    $this->actingAs($user)->getJson(route('api.line.calls.index'))->assertForbidden();
    $this->actingAs($user)->getJson(route('api.line.voicemails.index'))->assertForbidden();
    $this->actingAs($user)->getJson(route('api.line.settings.show'))->assertForbidden();
})->with(['saida', 'regina', 'andres']);

it('requires authentication on the line api', function () {
    $this->getJson(route('api.line.overview'))->assertUnauthorized();
});

it('lets guests still hit the signed webhook', function () {
    configurePrivacyNumber();
    silenceLineBroadcasts();

    postLineWebhook([
        'id' => 'evt_guest',
        'type' => 'sms.received',
        'data' => ['object' => ['id' => 'sms_guest']],
    ])->assertOk();
});
