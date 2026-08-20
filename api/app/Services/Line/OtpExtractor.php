<?php

namespace App\Services\Line;

use Illuminate\Support\Str;

/**
 * Pulls a one-time verification code out of an inbound SMS so the app can
 * surface it as a copyable chip — receiving OTPs is the number's main job.
 */
class OtpExtractor
{
    /**
     * Words that mark a message as carrying a verification code, in the
     * languages the line actually receives.
     */
    private const KEYWORDS = [
        'code', 'código', 'codigo', 'verification', 'verificación', 'verificacion',
        'otp', 'pin', 'clave', 'contraseña', 'password', 'access', 'acceso',
        'confirm', 'confirma', 'autenticación', 'authentication', '2fa',
    ];

    public static function extract(string $body): ?string
    {
        // Google-style prefixed codes ("G-482917") identify themselves.
        if (preg_match('/\bG-(\d{4,8})\b/', $body, $matches) === 1) {
            return $matches[1];
        }

        if (! Str::contains(Str::lower($body), self::KEYWORDS)) {
            return null;
        }

        if (preg_match('/\b(\d{4,8})\b/', $body, $matches) === 1) {
            return $matches[1];
        }

        // Split codes like "123-456" or "123 456".
        if (preg_match('/\b(\d{3})[- ](\d{3})\b/', $body, $matches) === 1) {
            return $matches[1].$matches[2];
        }

        return null;
    }
}
