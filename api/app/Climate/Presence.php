<?php

declare(strict_types=1);

namespace App\Climate;

enum Presence: string
{
    case Home = 'home';
    case Away = 'away';
}
