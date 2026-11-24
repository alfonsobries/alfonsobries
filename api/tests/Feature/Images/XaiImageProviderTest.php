<?php

use App\Images\Providers\XaiImageProvider;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    config()->set('images.providers.xai.api_key', 'test-key');
});

it('asks Grok Imagine 2.0 for the quality the catalog entry sets', function (): void {
    Http::fake(['api.x.ai/*' => Http::response(['data' => [['b64_json' => base64_encode('png-bytes')]]])]);

    $bytes = app(XaiImageProvider::class)->generate('a red box', [], [
        'model' => 'grok-imagine-image-2.0',
        'resolution' => '1k',
        'quality' => 'low',
    ]);

    expect($bytes)->toBe('png-bytes');

    Http::assertSent(fn (Request $request): bool => $request['model'] === 'grok-imagine-image-2.0'
        && $request['quality'] === 'low'
        && $request['resolution'] === '1k');
});

it('leaves quality out when the entry does not set one', function (): void {
    Http::fake(['api.x.ai/*' => Http::response(['data' => [['b64_json' => base64_encode('png-bytes')]]])]);

    app(XaiImageProvider::class)->generate('a red box', [], ['model' => 'grok-imagine-image']);

    Http::assertSent(fn (Request $request): bool => ! isset($request['quality']));
});
