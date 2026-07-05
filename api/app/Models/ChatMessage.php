<?php

namespace App\Models;

use Database\Factories\ChatMessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\File;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ChatMessage extends Model implements HasMedia
{
    /** @use HasFactory<ChatMessageFactory> */
    use HasFactory;

    use InteractsWithMedia;

    public const ROLE_USER = 'user';

    public const ROLE_ASSISTANT = 'assistant';

    public const STATUS_PENDING = 'pending';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'status',
        'error',
    ];

    /**
     * @return BelongsTo<Conversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('attachments')
            ->acceptsFile(fn (File $file) => Str::startsWith($file->mimeType, 'image/'));
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * The shape the app receives, both over HTTP and on the broadcast channel.
     *
     * @return array<string, mixed>
     */
    public function toApiPayload(): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'role' => $this->role,
            'content' => $this->content,
            'status' => $this->status,
            'error' => $this->error,
            'attachments' => $this->getMedia('attachments')
                ->map(fn (Media $media): array => [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                ])
                ->values()
                ->all(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
