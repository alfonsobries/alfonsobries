<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

class TestNotification extends Notification
{
    /**
     * @return array<int, class-string>
     */
    public function via(object $notifiable): array
    {
        return [ExpoChannel::class];
    }

    public function toExpo(object $notifiable): ExpoMessage
    {
        return ExpoMessage::create("Alfonso's App")
            ->body('This is a test notification 👋')
            ->playSound();
    }
}
