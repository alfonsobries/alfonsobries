<?php

namespace App\AI;

use App\Models\Assistant;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;

/**
 * A generic conversational agent whose behavior comes entirely from an
 * Assistant record: its instructions are the system prompt and the stored
 * conversation supplies the message history.
 */
class ChatAgent implements Agent, Conversational
{
    use Promptable;

    /**
     * @param  iterable<int, Message>  $history
     */
    public function __construct(
        private Assistant $assistant,
        private iterable $history = [],
    ) {}

    public function instructions(): string
    {
        return $this->assistant->instructions;
    }

    /**
     * @return iterable<int, Message>
     */
    public function messages(): iterable
    {
        return $this->history;
    }
}
