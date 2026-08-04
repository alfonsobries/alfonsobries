<?php

namespace App\Models;

use Database\Factories\PointEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * One movement in a kid's point ledger: an approved chore adds, a redeemed
 * reward subtracts, a parent can hand out or take back points by hand. The
 * entry names the goal the points sit in — null means the kid's free jar,
 * waiting to be handed to a goal.
 */
class PointEntry extends Model
{
    /** @use HasFactory<PointEntryFactory> */
    use HasFactory;

    /**
     * Points moved from one goal to another rather than earned or spent.
     */
    public const REASON_CARRY_OVER = 'carry-over';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'family_member',
        'delta',
        'reason',
        'reward_id',
        'source_type',
        'source_id',
        'created_by',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'delta' => 'integer',
    ];

    /**
     * @return MorphTo<Model, $this>
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<Reward, $this>
     */
    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
