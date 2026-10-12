<?php

declare(strict_types=1);

namespace App\Climate;

enum AcMode: int
{
    case Auto = 1;
    case Cool = 2;
    case Dry = 3;
    case Heat = 4;
    case Fan = 5;

    public static function fromName(string $name): self
    {
        return match ($name) {
            'auto' => self::Auto,
            'cool' => self::Cool,
            'dry' => self::Dry,
            'heat' => self::Heat,
            default => self::Fan,
        };
    }

    public function key(): string
    {
        return strtolower($this->name);
    }
}
