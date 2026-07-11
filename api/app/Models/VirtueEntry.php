<?php

namespace App\Models;

use App\Virtue\VirtueHabit;
use Database\Factories\VirtueEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * One completed habit on one day. A row means done — clearing the mark
 * deletes the row, so a day with no entry is simply pending.
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
        'completed_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'habit' => VirtueHabit::class,
        'completed_at' => 'datetime',
    ];
}
