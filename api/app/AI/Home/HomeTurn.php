<?php

namespace App\AI\Home;

use App\Models\HomeMessage;
use App\Models\User;

/**
 * Who is speaking and which answer is being written, what every tool needs
 * to attribute and link the changes it makes.
 */
readonly class HomeTurn
{
    public function __construct(
        public User $user,
        public HomeMessage $reply,
    ) {}

    public function source(): string
    {
        return $this->reply->source === HomeMessage::SOURCE_TELEGRAM ? 'telegram' : 'chat';
    }
}
