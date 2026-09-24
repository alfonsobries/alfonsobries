<?php

namespace App\Models;

use Database\Factories\HomeMessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\File;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * One turn of a person's home chat: what they said (text, photos, a voice
 * note) or the assistant's answer, with the expenses that answer touched.
 */
class HomeMessage extends Model implements HasMedia
{
    /** @use HasFactory<HomeMessageFactory> */
    use HasFactory;

    use InteractsWithMedia;

    public const ROLE_USER = 'user';

    public const ROLE_ASSISTANT = 'assistant';

    public const STATUS_PENDING = 'pending';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    public const SOURCE_APP = 'app';

    public const SOURCE_TELEGRAM = 'telegram';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'role',
        'content',
        'transcript',
        'status',
        'error',
        'source',
        'client_key',
        'telegram_chat_id',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The expenses this reply created, changed or removed, trashed ones
     * included, so a removal still renders on its card.
     *
     * @return BelongsToMany<Expense, $this, ExpensePivot>
     */
    public function expenses(): BelongsToMany
    {
        return $this->belongsToMany(Expense::class)
            ->using(ExpensePivot::class)
            ->withPivot('action')
            ->withTimestamps()
            ->withTrashed()
            ->orderByPivot('id');
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('images')
            ->acceptsFile(fn (File $file) => Str::startsWith($file->mimeType, 'image/'));

        $this
            ->addMediaCollection('audio')
            ->singleFile();
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * The words this turn carries: typed text, or what the voice note said.
     */
    public function spokenText(): string
    {
        return trim(implode("\n", array_filter([$this->content, $this->transcript])));
    }

    /**
     * The shape the app receives, both over HTTP and on the broadcast channel.
     *
     * @return array<string, mixed>
     */
    public function toApiPayload(): array
    {
        $this->loadMissing(['media', 'expenses.category', 'expenses.account']);

        $audio = $this->getFirstMedia('audio');

        return [
            'id' => $this->id,
            'role' => $this->role,
            'content' => $this->content,
            'transcript' => $this->transcript,
            'status' => $this->status,
            'error' => $this->error,
            'source' => $this->source,
            'client_key' => $this->client_key,
            'images' => $this->getMedia('images')
                ->map(fn (Media $media): array => [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                ])
                ->values()
                ->all(),
            'audio' => $audio === null ? null : [
                'id' => $audio->id,
                'url' => $audio->getUrl(),
                'duration' => $audio->getCustomProperty('duration'),
            ],
            'expenses' => $this->expenses
                ->map(fn (Expense $expense): array => [
                    ...$expense->toApiPayload(),
                    'action' => $expense->pivot->action,
                ])
                ->values()
                ->all(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
