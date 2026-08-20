<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;
use NotificationChannels\Telegram\TelegramMessage;

/**
 * Something happened to the line itself — paused, released, renewal at
 * risk, balance low. Losing the number would break every account verified
 * with it, so these go out on every channel that can reach Alfonso.
 */
class LineAlertNotification extends Notification
{
    public function __construct(
        private readonly string $title,
        private readonly string $body,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = [ExpoChannel::class];

        if (config('services.telegram-bot-api.token')) {
            $channels[] = 'telegram';
        }

        return $channels;
    }

    public function toExpo(object $notifiable): ExpoMessage
    {
        return ExpoMessage::create($this->title)
            ->body($this->body)
            ->data(['url' => '/line/settings'])
            ->high()
            ->playSound();
    }

    public function toTelegram(mixed $notifiable): TelegramMessage
    {
        return TelegramMessage::create()
            ->to(config('services.telegram-bot-api.chat_id'))
            ->content(sprintf("*%s*\n\n%s", $this->title, $this->body));
    }
}
