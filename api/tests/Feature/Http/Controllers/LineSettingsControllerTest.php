<?php

use App\Models\LineNumber;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    configurePrivacyNumber();
    Http::preventStrayRequests();
});

it('shows the mirrored number', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    LineNumber::factory()->create(['auto_renew' => true, 'ai_enabled' => false]);

    $this->actingAs($alfonso)
        ->getJson(route('api.line.settings.show'))
        ->assertOk()
        ->assertJsonPath('data.number.auto_renew', true);
});

it('pushes auto-renew and ai config to the provider', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $number = LineNumber::factory()->create(['provider_id' => 'num_test']);

    Http::fake([
        "https://api.privacynumber.io/v1/numbers/{$number->provider_id}" => Http::response(['id' => $number->provider_id]),
        "https://api.privacynumber.io/v1/numbers/{$number->provider_id}/ai" => Http::response(['enabled' => true]),
        'https://api.privacynumber.io/v1/numbers' => Http::response(['data' => [[
            'id' => $number->provider_id,
            'number' => $number->e164,
            'status' => 'active',
            'auto_renew' => false,
            'ai_enabled' => true,
        ]]]),
        'https://api.privacynumber.io/v1/account/usage' => Http::response(['sms' => 3]),
    ]);

    $this->actingAs($alfonso)
        ->patchJson(route('api.line.settings.update'), [
            'auto_renew' => false,
            'ai' => ['enabled' => true],
        ])
        ->assertOk()
        ->assertJsonPath('data.number.auto_renew', false)
        ->assertJsonPath('data.number.ai_enabled', true);
});
