<?php

namespace App\Models;

use Database\Factories\FavoriteIllustrationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\File;

/**
 * An illustration the family keeps: the image file is copied out of its chat
 * message into this model's own media, so the collection survives deleting
 * the conversation.
 */
class FavoriteIllustration extends Model implements HasMedia
{
    /** @use HasFactory<FavoriteIllustrationFactory> */
    use HasFactory;

    use InteractsWithMedia;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'chat_message_id',
        'prompt',
        'members',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'members' => 'array',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('image')
            ->singleFile()
            ->acceptsFile(fn (File $file) => Str::startsWith($file->mimeType, 'image/'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiPayload(): array
    {
        return [
            'id' => $this->id,
            'chat_message_id' => $this->chat_message_id,
            'prompt' => $this->prompt,
            'members' => $this->members,
            'url' => $this->getFirstMediaUrl('image') ?: null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
