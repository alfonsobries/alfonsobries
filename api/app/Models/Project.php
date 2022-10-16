<?php

namespace App\Models;

use App\Models\Traits\ExpiresFrontend;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;
use Spatie\Image\Manipulations;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\File;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Project extends Model implements HasMedia, Sortable
{
    use HasFactory;
    use InteractsWithMedia;
    use SortableTrait;
    use SoftDeletes;
    use ExpiresFrontend;

    const BANNER_WIDTH = 544;

    const BANNER_HEIGHT = 306;

    const TECHNOLOGIES = [
        'laravel',
        'vue',
        'react',
        'tailwind',
        'bootstrap',
        'jest',
        'redis',
        'js',
        'pgsql',
        'mysql',
        'php',
        'next',
        'ts',
        'html',
    ];

    public $sortable = [
        'order_column_name' => 'sort_order',
        'sort_when_creating' => true,
    ];

    protected $casts = [
        'technologies' => 'json',
        'is_published' => 'boolean',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'title',
        'description',
        'url',
        'technologies',
        'is_published',
    ];

    protected $appends = [
        'banner_url',
        'banner_url_2x',
    ];

    public function getBannerUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('banner', '1x');
    }

    public function getBannerUrl2xAttribute(): string
    {
        return $this->getFirstMediaUrl('banner', '2x');
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('banner')
            ->singleFile()
            ->acceptsFile(fn (File $file) => Str::startsWith($file->mimeType, 'image/'))
            ->registerMediaConversions(function (Media $media) {
                $this
                    ->addMediaConversion('1x')
                    ->fit(Manipulations::FIT_CROP, self::BANNER_WIDTH, self::BANNER_HEIGHT);
                $this
                    ->addMediaConversion('2x')
                    ->fit(Manipulations::FIT_CROP, self::BANNER_WIDTH * 2, self::BANNER_HEIGHT * 2);
            });
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }
}
