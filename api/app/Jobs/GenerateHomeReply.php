<?php

namespace App\Jobs;

use App\Events\HomeMessageUpdated;
use App\Models\HomeMessage;
use App\Services\HomeResponder;
use App\Services\Telegram\TelegramHomeBot;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class GenerateHomeReply implements ShouldQueue
{
    use Queueable;

    public int $timeout = 200;

    /**
     * Tools write expenses as they go; a blind retry could record one twice.
     */
    public int $tries = 1;

    public function __construct(
        public HomeMessage $message,
        public HomeMessage $reply,
    ) {}

    public function handle(HomeResponder $responder, TelegramHomeBot $telegram): void
    {
        $responder->respond($this->message, $this->reply);

        $reply = $this->reply->fresh();

        HomeMessageUpdated::dispatch($reply);

        $telegram->deliver($reply);
    }

    public function failed(?Throwable $exception): void
    {
        $this->reply->update([
            'status' => HomeMessage::STATUS_FAILED,
            'error' => $exception?->getMessage() ?? 'Reply generation failed.',
        ]);

        $reply = $this->reply->fresh();

        try {
            HomeMessageUpdated::dispatch($reply);
            app(TelegramHomeBot::class)->deliver($reply);
        } catch (Throwable $inner) {
            report($inner);
        }
    }
}
