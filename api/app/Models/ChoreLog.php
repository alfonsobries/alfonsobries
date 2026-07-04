<?php

namespace App\Models;

use Database\Factories\ChoreLogFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One day of one chore: the kid marks it done, then a parent approves or
 * rejects it in the evening review. Approved logs earn the kid's points.
 */
class ChoreLog extends Model
{
    /** @use HasFactory<ChoreLogFactory> */
    use HasFactory;

    /**
     * The kid says they did it; a parent hasn't looked yet.
     */
    public const STATUS_DONE = 'done';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'chore_id',
        'family_member',
        'date',
        'status',
        'reviewed_by',
        'points',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'points' => 'integer',
    ];

    /**
     * @return BelongsTo<Chore, $this>
     */
    public function chore(): BelongsTo
    {
        return $this->belongsTo(Chore::class)->withTrashed();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @param  Builder<ChoreLog>  $query
     */
    public function scopeToday($query): void
    {
        $query->whereDate('date', now()->toDateString());
    }

    public function isReviewed(): bool
    {
        return $this->status !== self::STATUS_DONE;
    }
}
