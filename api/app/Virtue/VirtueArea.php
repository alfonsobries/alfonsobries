<?php

namespace App\Virtue;

/**
 * The three areas the virtue practice measures. Habits feed points into an
 * area; the areas themselves never know how those points were earned.
 */
enum VirtueArea: string
{
    case Body = 'body';

    case Mind = 'mind';

    case Spirit = 'spirit';
}
