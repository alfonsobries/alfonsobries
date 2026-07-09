<?php

namespace App\Notifications;

use App\Models\Conversation;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

/**
 * Tells the person who asked for an illustration that it finished drawing —
 * generations take a minute or more, long enough to leave the chat.
 */
class IllustrationReadyNotification extends Notification
{
    public function __construct(
        private readonly Conversation $conversation,
        private readonly ?string $prompt,
    ) {}

    /**
     * @return array<int, class-string>
     */
    public function via(object $notifiable): array
    {
        return [ExpoChannel::class];
    }

    public function toExpo(object $notifiable): ExpoMessage
    {
        $body = $this->prompt === null || trim($this->prompt) === ''
            ? 'Your drawing is done — open the chat to see it.'
            : Str::limit(trim($this->prompt), 120);

        return ExpoMessage::create('Illustration ready 🎨')
            ->body($body)
            ->data(['conversation_id' => $this->conversation->id])
            ->playSound();
    }
}
