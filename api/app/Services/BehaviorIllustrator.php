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
 * Generates the kid-friendly illustration for a behavior. The shared visual
 * language lives in resources/illustrations/style-base.md; each family member
 * adds their own character prompt (character-<member>.md) and style reference
 * sheet (<member>-style-reference.png), both attached per generation.
 */
class BehaviorIllustrator
{
    private const STYLE_BASE = 'illustrations/style-base.md';

    private const REFERENCE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

    /**
     * How each member is named inside the prompts.
     */
    private const DISPLAY_NAMES = [
        'regina' => 'Regina',
        'andres' => 'Andrés',
        'saida' => 'Saida',
        'alfonso' => 'Alfonso',
    ];

    /**
     * Image edits with reference images regularly take 40-90s, longer under
     * load; the default HTTP timeout would abort mid-generation.
     */
    private const TIMEOUT = 240;

    public function generate(BehaviorIllustration $illustration): void
    {
        $illustration->update(['status' => BehaviorIllustration::STATUS_GENERATING]);

        $image = Image::of($this->composePrompt($illustration))
            ->attachments($this->referenceImages($illustration->family_member))
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

    /**
     * Freeform generation in the family's visual language, for tooling and
     * one-off art. With a member, their character sheet leads the scene;
     * without one, the style still applies but the scene stays object-only.
     * Returns the raw image bytes.
     */
    public function illustrate(?string $member, string $subject): string
    {
        $referenceMember = $member ?? 'alfonso';
        $references = $this->referenceImages($referenceMember);

        $parts = [];

        if ($references !== []) {
            $parts[] = $member === null
                ? 'Use the attached image ONLY as a reference for line style and palette.'
                : 'Use the attached image as the canonical character and style reference sheet.';
        }

        $parts[] = $this->stylePrompt();

        if ($member !== null && ($character = $this->characterPrompt($member)) !== null) {
            $parts[] = $character;
        }

        $parts[] = 'Subject: '.trim($subject).($member === null
            ? ' Strictly NO people, NO characters, NO faces — an object-only illustration.'
            : '');

        $image = Image::of(implode(' ', $parts))
            ->attachments($references)
            ->square()
            ->quality(config('site.illustrations.quality'))
            ->timeout(self::TIMEOUT)
            ->generate(
                Lab::from(config('site.illustrations.provider')),
                config('site.illustrations.model'),
            );

        return $image->firstImage()->content();
    }

    private function composePrompt(BehaviorIllustration $illustration): string
    {
        $member = $illustration->family_member;
        $name = self::DISPLAY_NAMES[$member] ?? Str::ucfirst($member);

        $parts = [$this->stylePrompt()];

        if ($this->referenceImages($member) !== []) {
            array_unshift($parts, 'Use the attached image as the canonical character and style reference sheet.');
        }

        if (($character = $this->characterPrompt($member)) !== null) {
            $parts[] = $character;
        }

        $parts[] = sprintf(
            'Subject: the behavior "%s". Show %s doing it in a gentle, didactic, kid-friendly way that a 4-6 year old '
            .'instantly recognizes — cartoonish energy, never aggression, fear or shame. If a simple symbolic scene '
            .'with one or two props from the reference sheet communicates the behavior better than the character, '
            .'draw that prop-only scene in the same style instead.',
            trim($illustration->name),
            $name,
        );

        return implode(' ', $parts);
    }

    /**
     * The shared style guide collapsed into a single generation-ready
     * paragraph — everything after the heading and intro notes.
     */
    private function stylePrompt(): string
    {
        $contents = FileSystem::get(resource_path(self::STYLE_BASE));

        $paragraphs = collect(explode("\n\n", $contents))
            ->map(fn (string $block): string => trim(Str::squish($block)))
            ->filter(fn (string $block): bool => $block !== '' && ! str_starts_with($block, '#'));

        // The first paragraph documents the file for humans; the rest is prompt.
        return $paragraphs->skip(1)->implode(' ');
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
     * The member's style reference sheet, when it has been dropped in place.
     *
     * @return array<int, Files\Image>
     */
    private function referenceImages(string $member): array
    {
        foreach (self::REFERENCE_EXTENSIONS as $extension) {
            $path = resource_path("illustrations/{$member}-style-reference.{$extension}");

            if (FileSystem::exists($path)) {
                return [Files\Image::fromPath($path)];
            }
        }

        return [];
    }
}
