<?php

namespace App\Models;

use App\Models\Concerns\HasIllustration;
use Database\Factories\BehaviorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;

/**
 * A behavior a kid is working on — the thing a parent taps when it happens.
 */
class Behavior extends Model implements HasMedia
{
    /** @use HasFactory<BehaviorFactory> */
    use HasFactory;

    use HasIllustration;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'family_member',
        'name',
        'points',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'points' => 'integer',
    ];

    /**
     * @return HasMany<BehaviorLog, $this>
     */
    public function logs(): HasMany
    {
        return $this->hasMany(BehaviorLog::class);
    }
}
