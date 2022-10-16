<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\Cache;

trait ExpiresFrontend
{
    public static function bootExpiresFrontend()
    {
        static::saved(function ($model) {
            if (self::shouldExpireFrontend($model)) {
                self::markFrontendAsExpired();
            }
        });

        static::deleted(function ($model) {
            if (self::shouldExpireFrontend($model)) {
                self::markFrontendAsExpired();
            }
        });
    }

    private static function markFrontendAsExpired()
    {
        Cache::set('fronted-expired', true);
    }

    public static function shouldExpireFrontend($model): bool
    {
        return true;
    }
}
