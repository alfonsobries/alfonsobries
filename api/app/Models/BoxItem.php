<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\BoxItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\File;

/**
 * Something stored in a box, pictured as a sticker: the phone cuts the
 * object out of its photo and outlines it before uploading.
 */
class BoxItem extends Model implements HasMedia
{
    /** @use HasFactory<BoxItemFactory> */
    use HasFactory;

    use InteractsWithMedia;

    public const MAX_QUANTITY = 999;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'box_id',
        'name',
        'quantity',
        'notes',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * @return BelongsTo<Box, $this>
     */
    public function box(): BelongsTo
    {
        return $this->belongsTo(Box::class);
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('sticker')
            ->singleFile()
            ->acceptsFile(fn (File $file): bool => Str::startsWith($file->mimeType, 'image/'));
    }

    public function stickerUrl(): ?string
    {
        return $this->getFirstMediaUrl('sticker') ?: null;
    }
}
