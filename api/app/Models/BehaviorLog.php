<?php

namespace App\Models;

use Database\Factories\BehaviorLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One tap of a behavior button: what happened, to which kid, who logged it,
 * and whether it hit the parent's mood. Together they form the feed.
 */
class BehaviorLog extends Model
{
    /** @use HasFactory<BehaviorLogFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'behavior_id',
        'family_member',
        'user_id',
        'points',
        'affected_mood',
        'mood_emoji',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'points' => 'integer',
        'affected_mood' => 'boolean',
    ];

    /**
     * @return BelongsTo<Behavior, $this>
     */
    public function behavior(): BelongsTo
    {
        return $this->belongsTo(Behavior::class)->withTrashed();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
