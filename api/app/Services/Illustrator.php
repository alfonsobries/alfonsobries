<?php

namespace App\Services;

use App\AI\ModelCatalog;
use App\Images\ImageManager;
use Illuminate\Support\Facades\File as FileSystem;
use Illuminate\Support\Str;

/**
 * The family illustrator: every AI illustration in the app — chat drawings,
 * behavior and reward art — goes through here so they all share the same
 * visual language, chroma-key pipeline and runtime-selected image model.
 *
 * The shared style lives in resources/illustrations/style-base.md; each family
 * member adds a character prompt (character-<member>.md) and a style reference
 * sheet (<member>-style-reference.png). Any combination of members can star in
 * one scene. Output is always a transparent square PNG: the artwork is
 * generated on a solid magenta chroma that IllustrationProcessor keys out.
 */
class Illustrator
{
    private const STYLE_BASE = 'illustrations/style-base.md';

    private const BACKGROUND_CHROMA = 'illustrations/background-chroma.md';

    private const REFERENCE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

    /**
     * How each member is named inside the prompts.
     */
    public const DISPLAY_NAMES = [
        'regina' => 'Regina',
        'andres' => 'Andrés',
        'saida' => 'Saida',
        'alfonso' => 'Alfonso',
    ];

    public function __construct(
        private readonly ImageManager $images,
        private readonly IllustrationProcessor $processor,
    ) {}

    /**
     * Generate a transparent square PNG featuring the given members (or a
     * member-free scene). Extra reference images and the previous generation
     * (for iterative "now change X" edits) ride along when provided.
     *
     * @param  list<string>  $members
     * @param  list<string>  $attachments  raw image bytes supplied by the user
     * @param  string|null  $previousImage  raw bytes of the prior generation
     * @return string transparent square PNG bytes
     */
    public function generate(array $members, string $subject, array $attachments = [], ?string $previousImage = null): string
    {
        $entry = ModelCatalog::active('image');
        $provider = $this->images->provider($entry['provider']);

        $raw = $provider->generate(
            $this->composePrompt($members, $subject, $previousImage !== null),
            $this->collectImages($members, $attachments, $previousImage, $provider->maxImages()),
            ['model' => $entry['model'], ...($entry['options'] ?? [])],
        );

        $cut = $this->processor->chromaKeyToTransparent($raw);

        return $this->processor->padToAspect($cut, 1, 1);
    }

    /**
     * @param  list<string>  $members
     */
    public function composePrompt(array $members, string $subject, bool $isFollowUp = false): string
    {
        $parts = [];

        $parts[] = match (true) {
            count($members) > 1 => 'Use the attached images as the canonical character and style reference sheets, one per character.',
            count($members) === 1 => 'Use the attached image as the canonical character and style reference sheet.',
            default => 'Use the attached image ONLY as a reference for line style and palette.',
        };

        $parts[] = $this->promptFile(self::STYLE_BASE, skipParagraphs: 1);

        foreach ($members as $member) {
            if (($character = $this->characterPrompt($member)) !== null) {
                $parts[] = $character;
            }
        }

        if (count($members) > 1) {
            $names = collect($members)
                ->map(fn (string $member): string => self::DISPLAY_NAMES[$member] ?? Str::ucfirst($member))
                ->join(', ', ' and ');

            $parts[] = "Feature {$names} TOGETHER in the same composition, side by side or interacting naturally, "
                .'each one true to their own reference sheet. This overrides any instruction to draw a single character.';
        }

        $parts[] = $this->promptFile(self::BACKGROUND_CHROMA, skipParagraphs: 1);

        $instruction = $isFollowUp
            ? 'This is a follow-up edit. Start from the previously generated image (the LAST attached image) and '
                .'modify it as follows, keeping its existing characters, layout and composition unchanged unless '
                .'this instruction explicitly changes them: '.trim($subject)
            : trim($subject);

        $parts[] = 'Subject: '.$instruction;

        return implode(' ', $parts);
    }

    /**
     * Reference sheets first, then user attachments, then the previous
     * generation LAST (prompts refer to "the LAST attached image"). When the
     * provider accepts fewer images, user attachments are dropped first —
     * character sheets and the iterated image are essential.
     *
     * @param  list<string>  $members
     * @param  list<string>  $attachments
     * @return list<string>
     */
    private function collectImages(array $members, array $attachments, ?string $previousImage, int $maxImages): array
    {
        $slots = $maxImages - ($previousImage !== null ? 1 : 0);

        $images = array_slice($this->referenceImages($members), 0, max(0, $slots));
        $slots -= count($images);

        $images = [...$images, ...array_slice($attachments, 0, max(0, $slots))];

        if ($previousImage !== null) {
            $images[] = $previousImage;
        }

        return $images;
    }

    /**
     * The style reference sheets for the given members; with no members the
     * scene still borrows Alfonso's sheet for line style and palette.
     *
     * @param  list<string>  $members
     * @return list<string> raw image bytes
     */
    private function referenceImages(array $members): array
    {
        $sheets = [];

        foreach ($members === [] ? ['alfonso'] : $members as $member) {
            foreach (self::REFERENCE_EXTENSIONS as $extension) {
                $path = resource_path("illustrations/{$member}-style-reference.{$extension}");

                if (FileSystem::exists($path)) {
                    $sheets[] = FileSystem::get($path);

                    break;
                }
            }
        }

        return $sheets;
    }

    /**
     * The member's short character sheet, when it exists.
     */
    private function characterPrompt(string $member): ?string
    {
        $path = resource_path("illustrations/character-{$member}.md");

        if (! FileSystem::exists($path)) {
            return null;
        }

        return Str::squish(FileSystem::get($path));
    }

    /**
     * A prompt fragment collapsed into a single generation-ready paragraph:
     * headings are dropped, and the first $skipParagraphs paragraphs (human
     * documentation) are skipped.
     */
    private function promptFile(string $path, int $skipParagraphs = 0): string
    {
        $contents = FileSystem::get(resource_path($path));

        return collect(explode("\n\n", $contents))
            ->map(fn (string $block): string => trim(Str::squish($block)))
            ->filter(fn (string $block): bool => $block !== '' && ! str_starts_with($block, '#'))
            ->skip($skipParagraphs)
            ->implode(' ');
    }
}
