<?php

declare(strict_types=1);

namespace App\Climate;

use RuntimeException;

class CarrierException extends RuntimeException
{
    public const SESSION_ENDED = [3106, 3144, 3176];

    public const UNIT_OFFLINE = [3123, 3125, 3178, 1305];

    public function isSessionEnded(): bool
    {
        return in_array($this->getCode(), self::SESSION_ENDED, true);
    }

    public function isUnitOffline(): bool
    {
        return in_array($this->getCode(), self::UNIT_OFFLINE, true);
    }
}
