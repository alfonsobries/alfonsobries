<?php

namespace App\Images\Providers;

use App\Contracts\Images\ImageProviderContract;
use App\Exceptions\Images\ImageProviderException;
use Illuminate\Support\Facades\Http;

class OpenAiImageProvider implements ImageProviderContract
{
    /**
     * gpt-image edits with reference images regularly take 40-90s, longer
     * under load; raise the client timeout well past the ~120s default.
     */
    private const TIMEOUT = 240;

    private readonly string $apiKey;

    private readonly string $model;

    private readonly string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) config('images.providers.openai.api_key');
        $this->model = (string) config('images.providers.openai.model');
        $this->baseUrl = (string) config('images.providers.openai.base_url');

        if (empty($this->apiKey)) {
            throw ImageProviderException::invalidConfiguration('openai', 'API key is not configured');
        }
    }

    /**
     * Call OpenAI's image edit endpoint (multipart, images attached as files).
     * gpt-image has no transparent mode, so callers request an opaque image on
     * a flat chroma background and key it out afterwards.
     */
    public function generate(string $prompt, array $images = [], array $options = []): string
    {
        $request = Http::withToken($this->apiKey)->timeout(self::TIMEOUT);

        foreach (array_values($images) as $index => $contents) {
            $request = $request->attach('image[]', $contents, "image-{$index}.png");
        }

        $response = $request->post(rtrim($this->baseUrl, '/').'/images/edits', [
            'model' => (string) ($options['model'] ?? $this->model),
            'prompt' => $prompt,
            'size' => '1024x1024',
            'quality' => (string) ($options['quality'] ?? config('images.providers.openai.quality')),
            'background' => 'opaque',
            'output_format' => 'png',
            'moderation' => 'low',
        ]);

        if (! $response->successful()) {
            throw ImageProviderException::requestFailed(
                'openai',
                $response->json('error.message', 'Unknown error'),
                $response->json(),
            );
        }

        $image = base64_decode((string) $response->json('data.0.b64_json'), true);

        if ($image === false || $image === '') {
            throw ImageProviderException::requestFailed('openai', 'No image data returned', $response->json());
        }

        return $image;
    }

    public function maxImages(): int
    {
        return 16;
    }

    public function getName(): string
    {
        return 'openai';
    }

    public function getModel(): string
    {
        return $this->model;
    }
}
