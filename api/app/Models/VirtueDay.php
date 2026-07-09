<?php

namespace App\Models;

use Database\Factories\VirtueDayFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * One day of the virtue practice: whether the daily prayers were completed
 * and whether the daily resolution was kept. A day with no resolution mark
 * is simply pending — only an explicit miss breaks the streak.
 */
class VirtueDay extends Model
{
    /** @use HasFactory<VirtueDayFactory> */
    use HasFactory;

    public const RESOLUTION_KEPT = 'kept';

    public const RESOLUTION_MISSED = 'missed';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'date',
        'prayers_completed_at',
        'resolution',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'prayers_completed_at' => 'datetime',
    ];
}
