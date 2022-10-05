<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\Cache;

trait ExpiresFrontend
{
    public static function bootExpiresFrontend()
    {
        static::saved(function() {
            self::markFrontendAsExpired();
        });

        static::deleted(function() {
            self::markFrontendAsExpired();
        });
    }

    private static function markFrontendAsExpired()
    {
        Cache::set('fronted-expired', true);
    }
}
