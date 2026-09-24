<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Something in the shared expenses changed, from either partner's chat,
 * Telegram or an edit screen. Carries no payload: listeners refetch what they
 * show.
 */
class ExpensesChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('expenses')];
    }

    public function broadcastAs(): string
    {
        return 'expenses.changed';
    }
}
