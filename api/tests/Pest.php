<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class)->in('Feature');

/**
 * Fake the image providers: configures test API keys and stubs every
 * generation endpoint with a tiny magenta PNG (which the chroma pipeline
 * keys out to a fully transparent image).
 */
function fakeImageGeneration(): void
{
    config([
        'images.providers.openai.api_key' => 'test-key',
        'images.providers.xai.api_key' => 'test-key',
    ]);

    Http::fake([
        '*/images/edits' => Http::response(['data' => [['b64_json' => base64_encode(fakeGeneratedPng())]]]),
        '*/images/generations' => Http::response(['data' => [['b64_json' => base64_encode(fakeGeneratedPng())]]]),
    ]);
}

function fakeGeneratedPng(): string
{
    $image = imagecreatetruecolor(4, 4);
    imagefill($image, 0, 0, imagecolorallocate($image, 255, 0, 255));

    ob_start();
    imagepng($image);

    return (string) ob_get_clean();
}

/**
 * The prompt sent to an image provider, whatever the wire format: OpenAI
 * posts multipart parts, xAI a JSON body.
 */
function sentImagePrompt(Request $request): string
{
    $data = $request->data();

    if (isset($data['prompt'])) {
        return (string) $data['prompt'];
    }

    $part = collect($data)->firstWhere('name', 'prompt');

    return (string) ($part['contents'] ?? '');
}
