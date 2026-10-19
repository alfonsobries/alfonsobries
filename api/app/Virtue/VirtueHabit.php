<?php

namespace App\Virtue;

/**
 * The entry-tracked habits: each one is a small module with its own rules
 * that talks to the core through one contract — a completed day emits one
 * point into the habit's area. The daily resolution predates this registry
 * and keeps its own storage on the day row, but follows the same contract into
 * every area.
 */
enum VirtueHabit: string
{
    case Exercise = 'exercise';

    case Diet = 'diet';

    case Sun = 'sun';

    case Reading = 'reading';

    public function area(): VirtueArea
    {
        return match ($this) {
            self::Exercise, self::Diet, self::Sun => VirtueArea::Body,
            self::Reading => VirtueArea::Mind,
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return list<self>
     */
    public static function forArea(VirtueArea $area): array
    {
        return array_values(array_filter(self::cases(), fn (self $habit): bool => $habit->area() === $area));
    }
}
