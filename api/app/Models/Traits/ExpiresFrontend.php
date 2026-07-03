<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

trait ExpiresFrontend
{
    public static function bootExpiresFrontend(): void
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

    private static function markFrontendAsExpired(): void
    {
        Cache::set(config('site.expireCacheKey'), true);
    }

    public static function shouldExpireFrontend(Model $model): bool
    {
        return true;
    }
}
