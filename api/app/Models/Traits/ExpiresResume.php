<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\Cache;

trait ExpiresResume
{
    public static function bootExpiresResume()
    {
        static::saved(function ($model) {
            self::markResumeAsExpired();
        });

        static::deleted(function ($model) {
            self::markResumeAsExpired();
        });
    }

    private static function markResumeAsExpired()
    {
        Cache::set(config('site.expireResumeKey'), true);
    }
}
