<?php

namespace App\Services;

use App\AI\Home\HomeAgent;
use App\AI\Home\HomeTurn;
use App\AI\Home\Tools\ExpenseSummary;
use App\AI\ModelCatalog;
use App\Events\HomeMessageUpdated;
use App\Models\Expense;
use App\Models\HomeMessage;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;
use Laravel\Ai\Transcription;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class HomeResponder
{
    private const TIMEOUT = 120;

    /**
     * How many earlier turns ride along as context. Enough to resolve "no,
     * eran 60" and follow a thread; older expenses are one tool call away.
     */
    private const HISTORY_TURNS = 24;

    /**
     * Answer a person's turn: transcribe a voice note if there is one, then
     * let the home agent act with its tools and write the reply.
     */
    public function respond(HomeMessage $message, HomeMessage $reply): void
    {
        $this->transcribe($message);

        $history = $message->user->homeMessages()
            ->with(['media', 'expenses.category', 'expenses.account'])
            ->where('id', '<', $message->id)
            ->where('status', HomeMessage::STATUS_COMPLETED)
            ->latest('id')
            ->limit(self::HISTORY_TURNS)
            ->get()
            ->reverse()
            ->map(fn (HomeMessage $entry) => $entry->role === HomeMessage::ROLE_USER
                ? new UserMessage($this->describeUserTurn($entry))
                : new AssistantMessage($this->describeAssistantTurn($entry)))
            ->values()
            ->all();

        $active = ModelCatalog::active('chat');

        $response = (new HomeAgent(new HomeTurn($message->user, $reply), $history))->prompt(
            $this->describeUserTurn($message, withAttachments: true),
            $message->getMedia('images')
                ->map(fn (Media $media) => Image::fromStorage($media->getPathRelativeToRoot(), $media->disk))
                ->values()
                ->all(),
            Lab::from($active['provider']),
            $active['model'],
            self::TIMEOUT,
        );

        $reply->update([
            'content' => trim($response->text) !== '' ? trim($response->text) : null,
            'status' => HomeMessage::STATUS_COMPLETED,
            'error' => null,
        ]);
    }

    private function transcribe(HomeMessage $message): void
    {
        $audio = $message->getFirstMedia('audio');

        if ($audio === null || $message->transcript !== null) {
            return;
        }

        $transcript = Transcription::fromStorage($audio->getPathRelativeToRoot(), $audio->disk)
            ->timeout(60)
            ->generate();

        $message->update(['transcript' => trim($transcript->text)]);

        HomeMessageUpdated::dispatch($message->fresh());
    }

    private function describeUserTurn(HomeMessage $message, bool $withAttachments = false): string
    {
        $text = $message->spokenText();
        $photos = $message->getMedia('images')->count();

        if ($photos > 0 && ! $withAttachments) {
            $text = trim("[{$photos} photo(s)] ".$text);
        }

        if ($text === '') {
            return $photos > 0 ? 'Here is a photo.' : '…';
        }

        return $message->source === HomeMessage::SOURCE_TELEGRAM ? "{$text}\n(sent from Telegram)" : $text;
    }

    /**
     * An earlier answer as the model sees it: its words plus the expenses it
     * touched, with ids so a correction can point at them.
     */
    private function describeAssistantTurn(HomeMessage $message): string
    {
        $lines = $message->expenses
            ->map(fn (Expense $expense): string => sprintf('[%s %s]', $expense->pivot->action, ExpenseSummary::line($expense)))
            ->implode("\n");

        return trim(($message->content ?? '')."\n".$lines) ?: '…';
    }
}
