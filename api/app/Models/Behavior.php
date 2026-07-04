<?php

namespace App\Models;

use Database\Factories\BehaviorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\File;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A behavior a kid is working on — the thing a parent taps when it happens.
 */
class Behavior extends Model implements HasMedia
{
    /** @use HasFactory<BehaviorFactory> */
    use HasFactory;

    use InteractsWithMedia;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'family_member',
        'name',
        'points',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'points' => 'integer',
    ];

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
     * @return HasMany<BehaviorLog, $this>
     */
    public function logs(): HasMany
    {
        return $this->hasMany(BehaviorLog::class);
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
