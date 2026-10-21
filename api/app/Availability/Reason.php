<?php

declare(strict_types=1);

namespace App\Availability;

/**
 * Which rule decided the current mode, in precedence order.
 */
enum Reason: string
{
    case Override = 'override';
    case Exception = 'exception';
    case Window = 'window';
    case OutsideHours = 'outside_hours';
}
