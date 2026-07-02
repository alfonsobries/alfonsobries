<?php

namespace App\Services\Apple;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class AppleTokenVerifier
{
    private const JWKS_URL = 'https://appleid.apple.com/auth/keys';

    private const ISSUER = 'https://appleid.apple.com';

    private const JWKS_CACHE_KEY = 'apple.jwks';

    private const JWKS_TTL = 86400;

    public function verify(string $identityToken): AppleVerifiedUser
    {
        $payload = $this->decodeWithRetry($identityToken);

        if (($payload->iss ?? null) !== self::ISSUER) {
            throw new InvalidAppleTokenException('Unexpected token issuer.');
        }

        if (! in_array($payload->aud ?? null, $this->allowedAudiences(), true)) {
            throw new InvalidAppleTokenException('Unexpected token audience.', 403);
        }

        $subject = $payload->sub ?? null;

        if (! is_string($subject) || $subject === '') {
            throw new InvalidAppleTokenException('Token is missing the subject.');
        }

        $email = isset($payload->email) && is_string($payload->email) ? $payload->email : null;

        $isPrivateRelay = ($payload->is_private_email ?? null) === true
            || ($payload->is_private_email ?? null) === 'true'
            || ($email !== null && str_ends_with($email, '@privaterelay.appleid.com'));

        return new AppleVerifiedUser($subject, $email, $isPrivateRelay);
    }

    private function decodeWithRetry(string $token): object
    {
        try {
            return JWT::decode($token, JWK::parseKeySet($this->jwks()));
        } catch (InvalidAppleTokenException $e) {
            throw $e;
        } catch (Throwable) {
            // Apple rotates its signing keys, so a decode failure may just mean a
            // stale JWKS cache — bust it and retry once before giving up.
            Cache::forget(self::JWKS_CACHE_KEY);

            try {
                return JWT::decode($token, JWK::parseKeySet($this->jwks()));
            } catch (Throwable $retry) {
                throw new InvalidAppleTokenException('Invalid Apple identity token.', 401, $retry);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function jwks(): array
    {
        return Cache::remember(self::JWKS_CACHE_KEY, self::JWKS_TTL, function () {
            $response = Http::get(self::JWKS_URL);

            if (! $response->successful()) {
                throw new InvalidAppleTokenException('Could not fetch Apple public keys.', 503);
            }

            return $response->json();
        });
    }

    /**
     * @return list<string>
     */
    private function allowedAudiences(): array
    {
        return array_values(array_filter([
            config('services.apple.client_id'),
            config('services.apple.services_id'),
        ]));
    }
}
