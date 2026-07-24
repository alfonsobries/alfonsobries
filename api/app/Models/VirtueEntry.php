<?php

namespace App\Models;

use App\Virtue\VirtueHabit;
use Database\Factories\VirtueEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * One completed habit on one day. A row means done — clearing the mark
 * deletes the row, so a day with no entry is simply pending. Measured habits
 * (exercise from Apple Health) also carry the day's minutes, which can raise
 * the points the entry emits.
 */
class VirtueEntry extends Model
{
    /** @use HasFactory<VirtueEntryFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'date',
        'habit',
        'minutes',
        'big',
        'completed_at',
    ];

    /**
     * The points this entry emits into its area: a completed day is one, and
     * a big exercise session — a measured hour or marked by hand — earns a
     * second.
     */
    public function points(): int
    {
        return $this->habit === VirtueHabit::Exercise && ($this->big || ($this->minutes ?? 0) >= 60)
            ? 2
            : 1;
    }

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'habit' => VirtueHabit::class,
        'minutes' => 'integer',
        'big' => 'boolean',
        'completed_at' => 'datetime',
    ];
}
