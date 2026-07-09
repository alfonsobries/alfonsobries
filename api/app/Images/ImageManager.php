<?php

namespace App\Images;

use App\Contracts\Images\ImageProviderContract;
use App\Exceptions\Images\ImageProviderException;
use App\Images\Providers\OpenAiImageProvider;
use App\Images\Providers\XaiImageProvider;

class ImageManager
{
    /** @var array<string, ImageProviderContract> */
    private array $providers = [];

    /** @var array<string, class-string<ImageProviderContract>> */
    private array $providerClasses = [
        'openai' => OpenAiImageProvider::class,
        'xai' => XaiImageProvider::class,
    ];

    public function provider(string $name): ImageProviderContract
    {
        return $this->providers[$name] ??= $this->resolveProvider($name);
    }

    /**
     * @param  class-string<ImageProviderContract>  $providerClass
     */
    public function extend(string $name, string $providerClass): void
    {
        $this->providerClasses[$name] = $providerClass;
    }

    private function resolveProvider(string $name): ImageProviderContract
    {
        if (! isset($this->providerClasses[$name])) {
            throw ImageProviderException::invalidConfiguration($name, 'Provider is not registered');
        }

        return app($this->providerClasses[$name]);
    }
}
