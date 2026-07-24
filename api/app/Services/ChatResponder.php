<?php

namespace App\Services;

use App\AI\ChatAgent;
use App\AI\ModelCatalog;
use App\Models\Assistant;
use App\Models\BehaviorIllustration;
use App\Models\ChatMessage;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ChatResponder
{
    /**
     * Generation can take a while on slow models; the queue job allows more.
     */
    private const TIMEOUT = 120;

    public function __construct(
        private readonly Illustrator $illustrator,
    ) {}

    /**
     * Fill a pending assistant message by prompting the conversation's
     * assistant with the full prior transcript. Illustrator assistants reply
     * with a generated image instead of text.
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

        if ($assistant->isIllustrator()) {
            $this->illustrate($message, $current, $transcript);

            return;
        }

        $history = $transcript
            ->reject(fn (ChatMessage $entry): bool => $entry->is($current))
            ->map(fn (ChatMessage $entry) => $entry->role === ChatMessage::ROLE_USER
                ? new UserMessage($entry->content ?? '', $this->attachmentsFor($entry))
                : new AssistantMessage($entry->content ?? ''))
            ->values()
            ->all();

        [$provider, $model] = $this->chatModelFor($assistant);

        $response = (new ChatAgent($assistant, $history))->prompt(
            $current->content ?? '',
            $this->attachmentsFor($current),
            Lab::from($provider),
            $model,
            self::TIMEOUT,
        );

        $message->update([
            'content' => $response->text,
            'status' => ChatMessage::STATUS_COMPLETED,
            'error' => null,
        ]);
    }

    /**
     * The provider/model pair to chat with: an Assistant's explicit override
     * wins; otherwise the runtime-selected chat model.
     *
     * @return array{string, string}
     */
    private function chatModelFor(Assistant $assistant): array
    {
        if ($assistant->model !== null) {
            return [$assistant->provider ?? config('site.chat.provider'), $assistant->model];
        }

        $active = ModelCatalog::active('chat');

        return [$assistant->provider ?? $active['provider'], $active['model']];
    }

    /**
     * Generate the illustration reply: the conversation's members star in the
     * scene, the user's attached photos ride along as references, and the
     * previous generated image (if any) makes the message an iterative edit.
     *
     * @param  Collection<int, ChatMessage>  $transcript
     */
    private function illustrate(ChatMessage $message, ChatMessage $current, Collection $transcript): void
    {
        $previous = $transcript
            ->filter(fn (ChatMessage $entry): bool => $entry->role === ChatMessage::ROLE_ASSISTANT)
            ->map(fn (ChatMessage $entry): ?Media => $entry->getFirstMedia('attachments'))
            ->filter()
            ->last();

        $bytes = $this->illustrator->generate(
            $message->conversation->members ?? [],
            $current->content ?? '',
            $current->getMedia('attachments')
                ->map(fn (Media $media): string => Storage::disk($media->disk)->get($media->getPathRelativeToRoot()))
                ->values()
                ->all(),
            $previous === null ? null : Storage::disk($previous->disk)->get($previous->getPathRelativeToRoot()),
        );

        $path = 'temp/chat-illustrations/'.Str::random(40).'.png';
        Storage::disk(BehaviorIllustration::DISK)->put($path, $bytes);

        $message->addMediaFromDisk($path, BehaviorIllustration::DISK)->toMediaCollection('attachments');

        $message->update([
            'content' => null,
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
