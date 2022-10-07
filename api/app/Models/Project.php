<?php

namespace App\Models;

use App\Models\Traits\ExpiresFrontend;
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

    const TECHNOLOGIES = [
        'laravel',
        'vue',
        'react',
        'tailwind',
        'bootstrap',
        // 'bulma',
        // 'inertia',
        // 'livewire',
    ];

    public $sortable = [
        'order_column_name' => 'sort_order',
        'sort_when_creating' => true,
    ];

    protected $casts = [
        'technologies' => 'json',
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
    ];

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('banner')
            ->singleFile()
            ->acceptsFile(fn (File $file) => Str::startsWith($file->mimeType, 'image/'))
            ->registerMediaConversions(function (Media $media) {
                $this
                    ->addMediaConversion('1x')
                    ->fit(Manipulations::FIT_CROP, 544, 306);
                $this
                    ->addMediaConversion('2x')
                    ->fit(Manipulations::FIT_CROP, 544 * 2, 306 * 2);
            });

    }
}
