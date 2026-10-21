<?php

declare(strict_types=1);

namespace App\Availability;

/**
 * How a brand answered the last push of the rules.
 */
enum PushStatus: string
{
    case Applied = 'applied';
    case Stale = 'stale';
    case Error = 'error';
}
