<?php

namespace App\Models;

use App\Models\Concerns\HasIllustration;
use Database\Factories\ChoreFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;

/**
 * A daily routine a kid is building — the positive mirror of a behavior.
 * The kid checks it off during the day; a parent reviews in the evening.
 */
class Chore extends Model implements HasMedia
{
    /** @use HasFactory<ChoreFactory> */
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
     * @return HasMany<ChoreLog, $this>
     */
    public function logs(): HasMany
    {
        return $this->hasMany(ChoreLog::class);
    }
}
