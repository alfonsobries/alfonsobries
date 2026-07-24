<?php

namespace App\Services;

use App\Events\BehaviorIllustrationUpdated;
use App\Models\BehaviorIllustration;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Generates the kid-friendly illustration for a behavior or reward through
 * the shared Illustrator core, so it uses the same visual language, chroma
 * pipeline and runtime-selected image model as everything else.
 */
class BehaviorIllustrator
{
    public function __construct(
        private readonly Illustrator $illustrator,
    ) {}

    public function generate(BehaviorIllustration $illustration): void
    {
        $illustration->update(['status' => BehaviorIllustration::STATUS_GENERATING]);

        $bytes = $this->illustrator->generate(
            [$illustration->family_member],
            $this->subjectFor($illustration),
        );

        $path = 'temp/behavior-illustrations/'.Str::random(40).'.png';
        Storage::disk(BehaviorIllustration::DISK)->put($path, $bytes);

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
        return $this->illustrator->generate(
            $member === null ? [] : [$member],
            trim($subject).($member === null
                ? ' Strictly NO people, NO characters, NO faces — an object-only illustration.'
                : ''),
        );
    }

    private function subjectFor(BehaviorIllustration $illustration): string
    {
        $member = $illustration->family_member;
        $name = Illustrator::DISPLAY_NAMES[$member] ?? Str::ucfirst($member);

        return sprintf(
            'the behavior "%s". Show %s doing it in a gentle, didactic, kid-friendly way that a 4-6 year old '
            .'instantly recognizes — cartoonish energy, never aggression, fear or shame. If a simple symbolic scene '
            .'with one or two props from the reference sheet communicates the behavior better than the character, '
            .'draw that prop-only scene in the same style instead.',
            trim($illustration->name),
            $name,
        );
    }
}
