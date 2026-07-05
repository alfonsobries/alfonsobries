<?php

namespace App\Jobs;

use App\Events\ChatMessageUpdated;
use App\Models\ChatMessage;
use App\Services\ChatResponder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class GenerateChatReply implements ShouldQueue
{
    use Queueable;

    public int $timeout = 180;

    public int $tries = 1;

    public function __construct(
        public ChatMessage $message,
    ) {}

    public function handle(ChatResponder $responder): void
    {
        $responder->respond($this->message);

        ChatMessageUpdated::dispatch($this->message->fresh());
    }

    public function failed(?Throwable $exception): void
    {
        $this->message->update([
            'status' => ChatMessage::STATUS_FAILED,
            'error' => $exception?->getMessage() ?? 'Reply generation failed.',
        ]);

        ChatMessageUpdated::dispatch($this->message);
    }
}
