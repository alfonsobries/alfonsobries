<?php

use App\Models\SupportAvailability;
use App\Models\SupportBrand;
use Illuminate\Testing\TestResponse;

beforeEach(function () {
    $this->travelTo(now()->parse('2026-10-20 10:00:00', 'America/Mexico_City'));
    enableSupportBrands();
});

function pullRules(?string $brand, ?string $secret): TestResponse
{
    $headers = array_filter([
        'X-Brand' => $brand,
        'Authorization' => $secret === null ? null : "Bearer {$secret}",
    ]);

    return test()->getJson(route('api.availability.rules'), $headers);
}

it('hands the rules to a brand that proves its secret', function () {
    SupportAvailability::factory()->create(['version' => 42]);

    pullRules('kondable', 'secret-kondable')
        ->assertOk()
        ->assertExactJson([
            'version' => 42,
            'updated_at' => '2026-10-20T16:00:00Z',
            'timezone' => 'America/Mexico_City',
            'weekly' => [
                ['days' => [1, 2, 3, 4, 5], 'from' => '07:00', 'to' => '20:00'],
                ['days' => [6], 'from' => '09:00', 'to' => '13:00'],
            ],
            'outside_hours_mode' => 'bot',
            'exceptions' => [],
            'override' => null,
        ]);

    expect(SupportBrand::query()->where('name', 'kondable')->value('last_pulled_at'))->not->toBeNull()
        ->and(SupportBrand::query()->where('name', 'zebrasnap')->value('last_pulled_at'))->toBeNull();
});

it('rejects a brand that cannot prove its secret', function (?string $brand, ?string $secret) {
    SupportAvailability::factory()->create();

    pullRules($brand, $secret)->assertUnauthorized();
})->with([
    'wrong secret' => ['zebrasnap', 'secret-kondable'],
    'unknown brand' => ['acme', 'secret-zebrasnap'],
    'no brand' => [null, 'secret-zebrasnap'],
    'no secret' => ['zebrasnap', null],
]);

it('rejects a disabled brand', function () {
    SupportAvailability::factory()->create();
    SupportBrand::query()->where('name', 'vexilo')->update(['enabled' => false]);

    pullRules('vexilo', 'secret-vexilo')->assertUnauthorized();
});

it('has no rules to share until the schedule is saved once', function () {
    pullRules('zebrasnap', 'secret-zebrasnap')->assertNotFound();
});

it('throttles pulls', function () {
    SupportAvailability::factory()->create();

    foreach (range(1, 30) as $attempt) {
        pullRules('zebrasnap', 'secret-zebrasnap')->assertOk();
    }

    pullRules('zebrasnap', 'secret-zebrasnap')->assertTooManyRequests();
});
