<?php

namespace App\Events;

use App\Models\HomeMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * A home chat message was created or settled, from the app, from Telegram,
 * or the assistant finishing its answer, so every open screen of that person
 * shows it without polling.
 */
class HomeMessageUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public HomeMessage $message,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('home.'.$this->message->user_id)];
    }

    public function broadcastAs(): string
    {
        return 'home.message';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return $this->message->toApiPayload();
    }
}
