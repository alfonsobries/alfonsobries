<?php

namespace App\Services;

use App\Events\HomeMessageUpdated;
use App\Jobs\GenerateHomeReply;
use App\Models\BehaviorIllustration;
use App\Models\HomeMessage;
use App\Models\User;
use Throwable;

/**
 * Takes a turn into a person's home chat, from the app or from Telegram,
 * and queues the assistant's answer. Both sources share this path so a
 * message sent from one shows up on the other.
 */
class HomeMessenger
{
    /**
     * @param  list<string>  $imagePaths  temp/… keys already on the upload disk
     * @return array{0: HomeMessage, 1: HomeMessage} the person's message and the pending reply
     */
    public function send(
        User $user,
        ?string $content,
        array $imagePaths = [],
        ?string $audioPath = null,
        ?int $audioDuration = null,
        string $source = HomeMessage::SOURCE_APP,
        ?string $clientKey = null,
        ?int $telegramChatId = null,
    ): array {
        if ($clientKey !== null && ($existing = $this->replay($user, $clientKey)) !== null) {
            return $existing;
        }

        $message = $user->homeMessages()->create([
            'role' => HomeMessage::ROLE_USER,
            'content' => filled($content) ? trim($content) : null,
            'status' => HomeMessage::STATUS_COMPLETED,
            'source' => $source,
            'client_key' => $clientKey,
            'telegram_chat_id' => $telegramChatId,
        ]);

        foreach ($imagePaths as $path) {
            $message->addMediaFromDisk($path, BehaviorIllustration::DISK)->toMediaCollection('images');
        }

        if ($audioPath !== null) {
            $message
                ->addMediaFromDisk($audioPath, BehaviorIllustration::DISK)
                ->withCustomProperties(['duration' => $audioDuration])
                ->toMediaCollection('audio');
        }

        $reply = $user->homeMessages()->create([
            'role' => HomeMessage::ROLE_ASSISTANT,
            'status' => HomeMessage::STATUS_PENDING,
            'source' => $source,
            'telegram_chat_id' => $telegramChatId,
        ]);

        $this->broadcast($message);

        try {
            GenerateHomeReply::dispatch($message, $reply);
        } catch (Throwable $exception) {
            // On the sync queue the job's failed() hook already marked the
            // reply; this keeps the request itself from turning into a 500.
            report($exception);
        }

        return [$message->fresh(), $reply->fresh()];
    }

    /**
     * A retried send (the app lost the response) returns what the first one
     * created instead of recording the expense twice.
     *
     * @return array{0: HomeMessage, 1: HomeMessage}|null
     */
    private function replay(User $user, string $clientKey): ?array
    {
        $message = $user->homeMessages()->where('client_key', $clientKey)->first();

        if ($message === null) {
            return null;
        }

        $reply = $user->homeMessages()
            ->where('role', HomeMessage::ROLE_ASSISTANT)
            ->where('id', '>', $message->id)
            ->orderBy('id')
            ->first();

        return $reply === null ? null : [$message, $reply];
    }

    private function broadcast(HomeMessage $message): void
    {
        try {
            HomeMessageUpdated::dispatch($message);
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
