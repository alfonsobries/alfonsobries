<?php

namespace App\Images\Providers;

use App\Contracts\Images\ImageProviderContract;
use App\Exceptions\Images\ImageProviderException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class XaiImageProvider implements ImageProviderContract
{
    private const TIMEOUT = 240;

    private readonly string $apiKey;

    private readonly string $model;

    private readonly string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) config('images.providers.xai.api_key');
        $this->model = (string) config('images.providers.xai.model');
        $this->baseUrl = (string) config('images.providers.xai.base_url');

        if (empty($this->apiKey)) {
            throw ImageProviderException::invalidConfiguration('xai', 'API key is not configured');
        }
    }

    /**
     * Call xAI's image endpoints (JSON only — the API rejects multipart).
     * Reference images go as base64 data URLs: a single image via the `image`
     * object, multiple via the `images` array. With no images it falls back
     * to plain generation.
     */
    public function generate(string $prompt, array $images = [], array $options = []): string
    {
        $images = array_values($images);

        $payload = [
            'model' => (string) ($options['model'] ?? $this->model),
            'prompt' => $this->adaptPrompt($prompt, count($images)),
            'resolution' => (string) ($options['resolution'] ?? config('images.providers.xai.resolution')),
            'response_format' => 'b64_json',
        ];

        if (count($images) === 1) {
            $payload['image'] = ['url' => $this->toDataUrl($images[0])];
        } elseif (count($images) > 1) {
            $payload['images'] = array_map(fn (string $contents): array => ['url' => $this->toDataUrl($contents)], $images);
        }

        $endpoint = $images === [] ? '/v1/images/generations' : '/v1/images/edits';

        $response = $this->client()->post("{$this->baseUrl}{$endpoint}", $payload);

        if (! $response->successful()) {
            throw ImageProviderException::requestFailed(
                'xai',
                $response->json('error.message', 'Unknown error'),
                $response->json(),
            );
        }

        $image = base64_decode((string) $response->json('data.0.b64_json'), true);

        if ($image === false || $image === '') {
            throw ImageProviderException::requestFailed('xai', 'No image data returned', $response->json());
        }

        return $image;
    }

    /**
     * xAI's multi-image editing addresses sources as <IMAGE_0>..<IMAGE_N>,
     * while shared prompts speak of "attached images" in order. Appending the
     * mapping keeps positional references ("the LAST attached image") working.
     */
    private function adaptPrompt(string $prompt, int $imageCount): string
    {
        if ($imageCount <= 1) {
            return $prompt;
        }

        $last = $imageCount - 1;

        return $prompt."\n\nThe attached images are <IMAGE_0> through <IMAGE_{$last}> in order; the LAST attached image is <IMAGE_{$last}>.";
    }

    private function toDataUrl(string $contents): string
    {
        return 'data:image/png;base64,'.base64_encode($contents);
    }

    public function maxImages(): int
    {
        return 3;
    }

    public function getName(): string
    {
        return 'xai';
    }

    public function getModel(): string
    {
        return $this->model;
    }

    private function client(): PendingRequest
    {
        return Http::withToken($this->apiKey)
            ->timeout(self::TIMEOUT)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ]);
    }
}
