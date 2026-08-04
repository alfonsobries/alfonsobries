<?php

namespace App\Models;

use App\Models\Concerns\HasIllustration;
use App\Observers\RewardObserver;
use Database\Factories\RewardFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;

/**
 * Something a kid is saving their chore points for. Each one holds its own
 * jar of points; the active one is where new points land.
 */
#[ObservedBy(RewardObserver::class)]
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
        'available_on',
        'requires_content_parents',
        'is_active',
        'achieved_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'cost' => 'integer',
        'available_on' => 'date',
        'requires_content_parents' => 'boolean',
        'is_active' => 'boolean',
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
