<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\File;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A single kid-friendly illustration on the model — AI-generated or uploaded —
 * with a square tile conversion for the app's grids.
 */
trait HasIllustration
{
    use InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('illustration')
            ->singleFile()
            ->acceptsFile(fn (File $file) => Str::startsWith($file->mimeType, 'image/'))
            ->registerMediaConversions(function (Media $media) {
                $this
                    ->addMediaConversion('tile')
                    ->fit(Fit::Crop, 512, 512);
            });
    }

    /**
     * The URL of the illustration, preferring the square tile conversion but
     * falling back to the original while the conversion is still queued.
     */
    public function imageUrl(): ?string
    {
        $media = $this->getFirstMedia('illustration');

        if ($media === null) {
            return null;
        }

        return $media->hasGeneratedConversion('tile') ? $media->getUrl('tile') : $media->getUrl();
    }
}
