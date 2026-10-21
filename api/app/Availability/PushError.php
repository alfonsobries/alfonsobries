<?php

declare(strict_types=1);

namespace App\Availability;

/**
 * Why the last push to a brand failed, for the app to explain.
 */
enum PushError: string
{
    case ConnectionFailed = 'connection_failed';
    case ServerError = 'server_error';
    case Rejected = 'rejected';
    case UnexpectedResponse = 'unexpected_response';
}
