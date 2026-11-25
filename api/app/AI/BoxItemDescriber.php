<?php

declare(strict_types=1);

namespace App\AI;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

/**
 * Names the thing in a box item photo in a few Spanish words, as a starting
 * point the person edits before saving.
 */
class BoxItemDescriber implements Agent
{
    use Promptable;

    public function instructions(): string
    {
        return <<<'TEXT'
        You label things people store in boxes at home. Look at the photo and name the main object
        in Spanish (Mexico), in 2 to 6 words, the way someone would write it on a list:
        a noun phrase with the useful detail (type, color, size or brand when clearly visible),
        e.g. "Cable USB-C a HDMI", "Esferas navideñas rojas", "Taladro inalámbrico DeWalt".
        Reply with the label only: no quotes, no trailing period, no explanation.
        If nothing is recognizable, reply with an empty line.
        TEXT;
    }
}
