<?php

namespace App\Models;

use App\Models\Concerns\HasIllustration;
use Database\Factories\RewardFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;

/**
 * Something a kid is saving their chore points for. The first unachieved
 * reward is the one their progress bar points at.
 */
class Reward extends Model implements HasMedia
{
    /** @use HasFactory<RewardFactory> */
    use HasFactory;

    use HasIllustration;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'family_member',
        'name',
        'cost',
        'achieved_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'cost' => 'integer',
        'achieved_at' => 'datetime',
    ];

    /**
     * @param  Builder<Reward>  $query
     */
    public function scopePending($query): void
    {
        $query->whereNull('achieved_at');
    }

    public function isAchieved(): bool
    {
        return $this->achieved_at !== null;
    }
}
