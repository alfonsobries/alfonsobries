<?php

namespace App\Models;

use App\Virtue\VirtueArea;
use Database\Factories\VirtueDayFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * One day of the virtue practice: whether the rosary and the daily prayers
 * were completed and whether the daily resolution was kept. A day with no
 * resolution mark is simply pending — only an explicit miss breaks the streak.
 */
class VirtueDay extends Model
{
    /** @use HasFactory<VirtueDayFactory> */
    use HasFactory;

    public const RESOLUTION_KEPT = 'kept';

    public const RESOLUTION_MISSED = 'missed';

    /**
     * Points per event. The rosary is the main weapon and never penalizes
     * when skipped. The daily resolution touches the whole person: a kept
     * day adds one to every area, a relapse takes three from every area,
     * and an unmarked day moves nothing. A day with nothing at all quietly
     * drains the spirit.
     */
    public const ROSARY_POINTS = 2;

    public const PRAYERS_POINTS = 1;

    public const RESOLUTION_POINTS = 1;

    public const MISS_PENALTY = 3;

    public const IDLE_PENALTY = 1;

    public const STAGE_COUNT = 30;

    /**
     * Points where spirit progress consolidates: once crossed, misses can
     * never drag the points below them again. Fractions of the spirit
     * journey; body and mind simply never go below zero.
     *
     * @var list<int>
     */
    public const CHECKPOINTS = [17, 52, 104, 173, 259];

    /**
     * Total points that complete an area's 30-stage journey, calibrated so a
     * realistic solid practice (not a flawless one) finishes in about 90
     * days — the habit-science window for forming a virtue or breaking a
     * vice. Solid weeks (resolution kept 6 of 7 included): spirit 6 full
     * days (+4) and one partial (+3) → 27; body exercise 6 with one big
     * session (7), diet 6, sun 5, resolution 6 → 24; mind reading 6,
     * resolution 6 → 12.
     *
     * @var array<string, int>
     */
    public const AREA_TOTALS = [
        'body' => 308,
        'mind' => 154,
        'spirit' => 345,
    ];

    /**
     * Minimum points for each stage of an area's journey, index 0 = stage 1.
     * A power curve (exponent 1.35) keeps early stages cheap — quick wins
     * when the risk of quitting is highest — while consolidation stretches
     * the last third.
     *
     * @return list<int>
     */
    public static function stageThresholds(VirtueArea $area): array
    {
        $total = self::AREA_TOTALS[$area->value];

        $thresholds = [];

        for ($index = 0; $index < self::STAGE_COUNT; $index++) {
            $thresholds[] = (int) round($total * (($index / (self::STAGE_COUNT - 1)) ** 1.35));
        }

        return $thresholds;
    }

    /**
     * @var list<string>
     */
    protected $fillable = [
        'date',
        'prayers_completed_at',
        'rosary_completed_at',
        'resolution',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'prayers_completed_at' => 'datetime',
        'rosary_completed_at' => 'datetime',
    ];
}
