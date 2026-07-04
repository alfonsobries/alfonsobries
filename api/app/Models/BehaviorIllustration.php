<?php

namespace App\Models;

use Database\Factories\BehaviorIllustrationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * An AI illustration request for a behavior. The app polls the status while
 * the image is generated into temp storage; once completed, the temp path is
 * attached to the behavior on save.
 */
class BehaviorIllustration extends Model
{
    /** @use HasFactory<BehaviorIllustrationFactory> */
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_GENERATING = 'generating';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    /**
     * Where the generated images live while they wait to be attached.
     */
    public const DISK = 's3';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'status',
        'path',
        'error',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * A short-lived URL for previewing the generated image in the app.
     */
    public function url(): ?string
    {
        if (! $this->isCompleted() || $this->path === null) {
            return null;
        }

        try {
            return Storage::disk(self::DISK)->temporaryUrl($this->path, now()->addMinutes(30));
        } catch (RuntimeException) {
            // Local/testing disks can't sign URLs; fall back to a plain one.
            return Storage::disk(self::DISK)->url($this->path);
        }
    }
}
