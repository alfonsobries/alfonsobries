<?php

declare(strict_types=1);

namespace App\Availability;

/**
 * Who answers the support chats: Alfonso (with the bot drafting), the bot on
 * its own, or nobody (the chat shows the leave-a-message form).
 */
enum Mode: string
{
    case Online = 'online';
    case Bot = 'bot';
    case Offline = 'offline';
}
