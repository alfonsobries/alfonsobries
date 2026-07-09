<?php

namespace App\Exceptions\Images;

use Exception;
use Throwable;

class ImageProviderException extends Exception
{
    /**
     * @param  array<string, mixed>|null  $response
     */
    public function __construct(
        string $message,
        public readonly ?string $provider = null,
        public readonly ?array $response = null,
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }

    /**
     * @param  array<string, mixed>|null  $response
     */
    public static function requestFailed(string $provider, string $reason, ?array $response = null): self
    {
        return new self(
            message: "Image request to {$provider} failed: {$reason}",
            provider: $provider,
            response: $response,
        );
    }

    public static function invalidConfiguration(string $provider, string $detail): self
    {
        return new self(
            message: "Invalid configuration for image provider {$provider}: {$detail}",
            provider: $provider,
        );
    }
}
