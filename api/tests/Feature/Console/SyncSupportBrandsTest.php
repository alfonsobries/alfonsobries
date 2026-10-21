<?php

use App\Models\SupportAvailability;
use App\Models\SupportBrand;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

it('copies the brands from config and enables the ones with a URL and a secret', function () {
    config([
        'support.brands.zebrasnap.url' => 'https://zebrasnap.com/api/',
        'support.brands.zebrasnap.secret' => 'zs-secret',
        'support.brands.kondable.url' => 'https://api.kondable.com/api',
        'support.brands.kondable.secret' => null,
    ]);

    $this->artisan('availability:sync-brands')->assertSuccessful();

    $zebrasnap = SupportBrand::query()->where('name', 'zebrasnap')->sole();

    expect($zebrasnap->enabled)->toBeTrue()
        ->and($zebrasnap->base_url)->toBe('https://zebrasnap.com/api')
        ->and($zebrasnap->pushUrl())->toBe('https://zebrasnap.com/api/support/availability')
        ->and($zebrasnap->secret)->toBe('zs-secret')
        ->and($zebrasnap->getRawOriginal('secret'))->not->toBe('zs-secret')
        ->and(SupportBrand::query()->where('name', 'kondable')->value('enabled'))->toBeFalse()
        ->and(SupportBrand::query()->count())->toBe(3);
});

it('pushes the rules afterwards when asked', function () {
    Http::fake(['*' => Http::response(['status' => 'applied', 'version' => 3, 'mode' => 'online'])]);
    SupportAvailability::factory()->create(['version' => 3]);
    config([
        'support.brands.vexilo.url' => 'https://vexilo.test/api',
        'support.brands.vexilo.secret' => 'vx',
    ]);

    $this->artisan('availability:sync-brands', ['--push' => true])->assertSuccessful();

    Http::assertSent(fn (Request $request): bool => $request->url() === 'https://vexilo.test/api/support/availability');
});

it('does not push a schedule that was never saved', function () {
    Http::fake();

    $this->artisan('availability:sync-brands', ['--push' => true])
        ->expectsOutputToContain('nothing to push')
        ->assertSuccessful();

    Http::assertNothingSent();
});
