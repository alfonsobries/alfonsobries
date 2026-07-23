<?php

declare(strict_types=1);

namespace App\Virtue;

use App\Models\VirtueDay;
use Illuminate\Support\Facades\Cache;

/**
 * The layered journey art on disk: one PNG per game stage per set.
 *
 * Art responses are cached for a year and immutable, so a replaced stage only
 * reaches a device whose cache already holds it if the URL changes too. The
 * version below travels as a query param for exactly that.
 *
 * It hashes names and sizes rather than contents (a 40 MB digest per request)
 * or modification times (a fresh checkout would bust every device's cache on
 * each deploy, re-downloading art that never changed).
 */
class JourneyArt
{
    /**
     * @var list<string>
     */
    public const SETS = ['tierra', 'cielo', 'arbol', 'arbol-icon'];

    public static function stageCount(): int
    {
        return count(VirtueDay::STAGE_THRESHOLDS);
    }

    public static function version(): string
    {
        return Cache::remember('virtue.art-version', now()->addMinutes(5), function (): string {
            $stamps = [];

            foreach (self::SETS as $set) {
                foreach (glob(resource_path("illustrations/{$set}/*.png")) ?: [] as $file) {
                    $stamps[] = basename($file).filesize($file);
                }
            }

            return substr(md5(implode('|', $stamps)), 0, 8);
        });
    }
}
