<?php

namespace App\Models;

use App\Models\Traits\ExpiresFrontend;
use App\Models\Traits\HasSlugHistory;
use Carbon\Carbon;
use Database\Factories\ArticleFactory;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\File;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\HasTranslatableSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Translatable\HasTranslations;

class Article extends Model implements HasMedia
{
    use ExpiresFrontend;

    /** @use HasFactory<ArticleFactory> */
    use HasFactory;

    use HasSlugHistory;
    use HasTranslatableSlug;
    use HasTranslations;
    use InteractsWithMedia;
    use SoftDeletes;

    protected $casts = [
        'published_at' => 'datetime',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'excerpt',
        'meta_description',
        'body',
        'published_at',
    ];

    /**
     * @var list<string>
     */
    public $translatable = [
        'title',
        'slug',
        'body',
        'excerpt',
        'meta_description',
    ];

    /**
     * Get the options for generating the slug.
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published_at', '<=', Carbon::now());
    }

    public function scopeNotPublished(Builder $query): Builder
    {
        return $query->whereNull('published_at');
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('banner')
            ->singleFile()
            ->useFallbackUrl(
                sprintf('https://og.alfonsobries.com/%s.png', $this->title)
            )
            ->acceptsFile(fn (File $file) => Str::startsWith($file->mimeType, 'image/'))
            ->registerMediaConversions(function (Media $media) {
                $this
                    ->addMediaConversion('og')
                    ->fit(Fit::Crop, 1200, 630);

                $this
                    ->addMediaConversion('thumbnail')
                    ->fit(Fit::Crop, 30, 30);
            });
    }

    public function url(): string
    {
        return sprintf('%s/posts/%s', config('site.site_url'), $this->slug);
    }

    public function previewUrl(): ?string
    {
        if (config('site.secret_prefix') === false) {
            return null;
        }

        return sprintf('%s/secret/%s/posts/%s', config('site.site_url'), config('site.secret_prefix'), $this->slug);
    }
}
