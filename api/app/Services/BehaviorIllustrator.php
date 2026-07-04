<?php

namespace App\Services;

use App\Events\BehaviorIllustrationUpdated;
use App\Models\BehaviorIllustration;
use Illuminate\Support\Facades\File as FileSystem;
use Illuminate\Support\Str;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files;
use Laravel\Ai\Image;

/**
 * Generates the kid-friendly illustration for a behavior. The visual language
 * lives in resources/illustrations/style.md, and the single canonical style
 * reference image (colors, line style, characters) sits next to it as
 * style-reference.png — attached to every request when present.
 */
class BehaviorIllustrator
{
    private const STYLE_GUIDE = 'illustrations/style.md';

    private const STYLE_REFERENCE = 'illustrations/style-reference';

    private const STYLE_REFERENCE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

    /**
     * Image edits with reference images regularly take 40-90s, longer under
     * load; the default HTTP timeout would abort mid-generation.
     */
    private const TIMEOUT = 240;

    public function generate(BehaviorIllustration $illustration): void
    {
        $illustration->update(['status' => BehaviorIllustration::STATUS_GENERATING]);

        $image = Image::of($this->composePrompt($illustration->name))
            ->attachments($this->referenceImages())
            ->square()
            ->quality(config('site.illustrations.quality'))
            ->timeout(self::TIMEOUT)
            ->generate(
                Lab::from(config('site.illustrations.provider')),
                config('site.illustrations.model'),
            );

        $path = $image->store('temp/behavior-illustrations', BehaviorIllustration::DISK);

        $illustration->update([
            'status' => BehaviorIllustration::STATUS_COMPLETED,
            'path' => $path,
            'error' => null,
        ]);

        BehaviorIllustrationUpdated::dispatch($illustration);
    }

    private function composePrompt(string $subject): string
    {
        $style = $this->stylePrompt();

        if ($this->referenceImages() !== []) {
            $style = 'Use the attached image as the canonical style reference. '.$style;
        }

        return $style.' Subject: a child doing "'.trim($subject).'".';
    }

    /**
     * The style guide markdown collapsed into a single generation-ready
     * paragraph — everything after the heading and intro notes.
     */
    private function stylePrompt(): string
    {
        $contents = FileSystem::get(resource_path(self::STYLE_GUIDE));

        $paragraphs = collect(explode("\n\n", $contents))
            ->map(fn (string $block): string => trim(Str::squish($block)))
            ->filter(fn (string $block): bool => $block !== '' && ! str_starts_with($block, '#'));

        // The first paragraph documents the file for humans; the rest is prompt.
        return $paragraphs->skip(1)->implode(' ');
    }

    /**
     * The canonical style reference, when it has been dropped in place.
     *
     * @return array<int, Files\Image>
     */
    private function referenceImages(): array
    {
        foreach (self::STYLE_REFERENCE_EXTENSIONS as $extension) {
            $path = resource_path(self::STYLE_REFERENCE.'.'.$extension);

            if (FileSystem::exists($path)) {
                return [Files\Image::fromPath($path)];
            }
        }

        return [];
    }
}
