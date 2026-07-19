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
     * What a missed day costs in mascot points; asymmetric on purpose (a kept
     * day earns one) but never a restart from zero.
     */
    public const MISS_PENALTY = 10;

    /**
     * Points where the mascot's progress consolidates: once crossed, misses
     * can never drag the points below them again.
     *
     * @var list<int>
     */
    public const CHECKPOINTS = [7, 30, 90, 180, 365];

    /**
     * Minimum points for each of the mascot's stages, index 0 = stage 1.
     * Short early stages give quick wins when the risk is highest; later
     * stages stretch out as consolidation takes over.
     *
     * @var list<int>
     */
    public const STAGE_THRESHOLDS = [
        0, 1, 3, 5, 7,
        10, 14, 18, 22, 26, 30,
        40, 50, 60, 75, 90,
        110, 130, 155, 180,
        210, 240, 270, 300, 330, 365,
        450, 550, 730, 1095,
    ];

    /**
     * Distinct journey-art frames per layer (tierra / cielo / arbol). Game
     * stages (STAGE_THRESHOLDS) map onto these via journeyArtStage().
     */
    public const JOURNEY_ART_STAGES = 3;

    /**
     * Map a 1-based game stage onto a journey-art frame (1..JOURNEY_ART_STAGES).
     */
    public static function journeyArtStage(int $stage): int
    {
        $total = count(self::STAGE_THRESHOLDS);

        return (int) min(
            self::JOURNEY_ART_STAGES,
            max(1, (int) ceil($stage * self::JOURNEY_ART_STAGES / max(1, $total))),
        );
    }

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
