<?php

namespace App\Contracts\Images;

interface ImageProviderContract
{
    /**
     * Generate an image from a prompt plus ordered reference images.
     *
     * Order matters: prompts may refer to "the LAST attached image" for
     * iterative edits, so providers must preserve the given order.
     *
     * @param  array<int, string>  $images  Raw image file contents
     * @param  array<string, mixed>  $options  Per-call overrides (model, quality, resolution…)
     * @return string Raw generated image bytes
     */
    public function generate(string $prompt, array $images = [], array $options = []): string;

    /**
     * Maximum number of reference images accepted per request.
     */
    public function maxImages(): int;

    public function getName(): string;

    public function getModel(): string;
}
