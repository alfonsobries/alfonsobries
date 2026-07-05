<?php

namespace App\Services;

use App\Jobs\GenerateChatReply;
use App\Models\BehaviorIllustration;
use App\Models\ChatMessage;
use App\Models\Conversation;
use Throwable;

class ChatMessenger
{
    /**
     * Record a user message and queue the assistant's reply.
     *
     * @param  list<string>  $imagePaths  temp/… keys already uploaded to S3
     * @return array{0: ChatMessage, 1: ChatMessage} the user message and the pending reply
     */
    public function send(Conversation $conversation, ?string $content, array $imagePaths = []): array
    {
        $userMessage = $conversation->messages()->create([
            'role' => ChatMessage::ROLE_USER,
            'content' => $content,
            'status' => ChatMessage::STATUS_COMPLETED,
        ]);

        foreach ($imagePaths as $path) {
            $userMessage
                ->addMediaFromDisk($path, BehaviorIllustration::DISK)
                ->toMediaCollection('attachments');
        }

        $reply = $conversation->messages()->create([
            'role' => ChatMessage::ROLE_ASSISTANT,
            'status' => ChatMessage::STATUS_PENDING,
        ]);

        $conversation->touch();

        try {
            GenerateChatReply::dispatch($reply);
        } catch (Throwable $exception) {
            // On the sync queue the job's failed() hook already marked the
            // row; this keeps the request itself from turning into a 500.
            report($exception);
        }

        return [$userMessage, $reply->fresh()];
    }
}
