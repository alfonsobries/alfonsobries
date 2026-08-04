<?php

namespace App\Models;

use Database\Factories\FamilyTimeEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * One movement in the family's time bank: a confirmed phone report adds
 * minutes, an activity everyone does together spends them. One jar for the
 * whole family — the minutes are owed to all of them at once.
 */
class FamilyTimeEntry extends Model
{
    /** @use HasFactory<FamilyTimeEntryFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'minutes',
        'reason',
        'source_type',
        'source_id',
        'created_by',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'minutes' => 'integer',
    ];

    /**
     * @return MorphTo<Model, $this>
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
