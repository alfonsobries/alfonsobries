<?php

namespace App\Services;

use App\AI\ChatAgent;
use App\Models\ChatMessage;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;

class ChatResponder
{
    /**
     * Generation can take a while on slow models; the queue job allows more.
     */
    private const TIMEOUT = 120;

    /**
     * Fill a pending assistant message by prompting the conversation's
     * assistant with the full prior transcript.
     */
    public function respond(ChatMessage $message): void
    {
        $conversation = $message->conversation()->with('assistant')->firstOrFail();
        $assistant = $conversation->assistant;

        $transcript = $conversation->messages()
            ->whereKeyNot($message->id)
            ->where('status', ChatMessage::STATUS_COMPLETED)
            ->orderBy('id')
            ->get();

        /** @var ChatMessage|null $current */
        $current = $transcript->last(fn (ChatMessage $entry): bool => $entry->role === ChatMessage::ROLE_USER);

        if ($current === null) {
            $message->update([
                'status' => ChatMessage::STATUS_FAILED,
                'error' => 'There is no user message to reply to.',
            ]);

            return;
        }

        $history = $transcript
            ->reject(fn (ChatMessage $entry): bool => $entry->is($current))
            ->map(fn (ChatMessage $entry) => $entry->role === ChatMessage::ROLE_USER
                ? new UserMessage($entry->content ?? '', $this->attachmentsFor($entry))
                : new AssistantMessage($entry->content ?? ''))
            ->values()
            ->all();

        $response = (new ChatAgent($assistant, $history))->prompt(
            $current->content ?? '',
            $this->attachmentsFor($current),
            Lab::from($assistant->provider ?? config('site.chat.provider')),
            $assistant->model ?? config('site.chat.model'),
            self::TIMEOUT,
        );

        $message->update([
            'content' => $response->text,
            'status' => ChatMessage::STATUS_COMPLETED,
            'error' => null,
        ]);
    }

    /**
     * @return list<Image>
     */
    private function attachmentsFor(ChatMessage $message): array
    {
        return $message->getMedia('attachments')
            ->map(fn ($media) => Image::fromStorage($media->getPathRelativeToRoot(), $media->disk))
            ->values()
            ->all();
    }
}
