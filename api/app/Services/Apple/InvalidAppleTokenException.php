<?php

namespace App\Services\Apple;

use Exception;
use Throwable;

class InvalidAppleTokenException extends Exception
{
    public function __construct(string $message, private readonly int $statusCode = 401, ?Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
    }

    public function statusCode(): int
    {
        return $this->statusCode;
    }
}
