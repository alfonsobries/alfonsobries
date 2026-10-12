<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

/**
 * Tells the parents the house switched its air conditioners off because nobody
 * was home, or back on because someone returned.
 */
class ClimateAutomationNotification extends Notification
{
    public function __construct(
        private readonly string $title,
        private readonly string $body,
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
        return ExpoMessage::create($this->title)->body($this->body);
    }
}
