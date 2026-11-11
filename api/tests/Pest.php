<?php

use App\Events\LineCallUpdated;
use App\Events\LineMessageUpdated;
use App\Events\LineVoicemailUpdated;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
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
function configurePrivacyNumber(): void
{
    config([
        'services.privacynumber.key' => 'sk_test_key',
        'services.privacynumber.webhook_secret' => 'whsec_test',
        'services.privacynumber.base_url' => 'https://api.privacynumber.io/v1',
    ]);
}

function silenceLineBroadcasts(): void
{
    Event::fake([
        LineMessageUpdated::class,
        LineCallUpdated::class,
        LineVoicemailUpdated::class,
    ]);
}

/**
 * @param  array<string, mixed>  $payload
 * @param  array{timestamp?: int, secret?: string, signature?: string}  $overrides
 */
function postLineWebhook(array $payload, array $overrides = []): TestResponse
{
    $timestamp = $overrides['timestamp'] ?? now()->getTimestamp();
    $secret = $overrides['secret'] ?? (string) config('services.privacynumber.webhook_secret');
    $body = json_encode($payload, JSON_THROW_ON_ERROR);
    $signature = $overrides['signature'] ?? hash_hmac('sha256', $timestamp.'.'.$body, $secret);

    return test()->call(
        'POST',
        route('api.line.webhook'),
        [],
        [],
        [],
        test()->transformHeadersToServerVars([
            'X-PrivacyNumber-Signature' => "t={$timestamp},v1={$signature}",
            'Content-Type' => 'application/json',
        ]),
        $body,
    );
}

/**
 * @param  array<string, mixed>  $object
 * @return array<string, mixed>
 */
function lineEventPayload(string $id, string $type, array $object): array
{
    return [
        'id' => $id,
        'type' => $type,
        'data' => ['object' => $object],
    ];
}

function sentImagePrompt(Request $request): string
{
    $data = $request->data();

    if (isset($data['prompt'])) {
        return (string) $data['prompt'];
    }

    $part = collect($data)->firstWhere('name', 'prompt');

    return (string) ($part['contents'] ?? '');
}
