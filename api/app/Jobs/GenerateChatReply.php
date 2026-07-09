<?php

namespace App\Jobs;

use App\Events\ChatMessageUpdated;
use App\Models\ChatMessage;
use App\Notifications\IllustrationReadyNotification;
use App\Services\ChatResponder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class GenerateChatReply implements ShouldQueue
{
    use Queueable;

    /**
     * Illustrator replies wait on image generation, which can take several
     * minutes with reference images; text replies finish far sooner.
     */
    public int $timeout = 320;

    public int $tries = 1;

    public function __construct(
        public ChatMessage $message,
    ) {}

    public function handle(ChatResponder $responder): void
    {
        $responder->respond($this->message);

        $message = $this->message->fresh();

        ChatMessageUpdated::dispatch($message);

        $this->notifyIllustrationReady($message);
    }

    /**
     * Illustrations take a minute or more — long enough to leave the chat —
     * so their completion pings the person who asked. Best-effort: a push
     * failure never fails an already generated reply.
     */
    private function notifyIllustrationReady(ChatMessage $message): void
    {
        if (! $message->isCompleted()) {
            return;
        }

        $conversation = $message->conversation()->with(['assistant', 'user'])->first();

        if ($conversation === null || ! $conversation->assistant->isIllustrator()) {
            return;
        }

        try {
            $prompt = $conversation->messages()
                ->where('role', ChatMessage::ROLE_USER)
                ->where('id', '<', $message->id)
                ->latest('id')
                ->value('content');

            $conversation->user->notify(new IllustrationReadyNotification($conversation, $prompt));
        } catch (Throwable $exception) {
            report($exception);
        }
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
