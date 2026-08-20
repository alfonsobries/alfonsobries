<?php

namespace App\Services\Line;

use Illuminate\Http\Client\Response;
use RuntimeException;

/**
 * A failed request to the privacynumber.io API, carrying the provider's
 * structured error envelope so callers can react to specific codes.
 */
class PrivacyNumberException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?string $type = null,
        public readonly ?string $errorCode = null,
        public readonly ?string $param = null,
        public readonly ?string $requestId = null,
        public readonly ?int $status = null,
    ) {
        parent::__construct($message);
    }

    public static function fromResponse(Response $response): self
    {
        $error = $response->json('error') ?? [];

        return new self(
            $error['message'] ?? 'The phone provider request failed.',
            type: $error['type'] ?? null,
            errorCode: $error['code'] ?? null,
            param: $error['param'] ?? null,
            requestId: $error['request_id'] ?? null,
            status: $response->status(),
        );
    }
}
