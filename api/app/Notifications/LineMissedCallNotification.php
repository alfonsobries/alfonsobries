<?php

namespace App\Notifications;

use App\Models\LineCall;
use Illuminate\Notifications\Notification;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

class LineMissedCallNotification extends Notification
{
    public function __construct(
        private readonly LineCall $call,
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
        return ExpoMessage::create('Missed call')
            ->body($this->call->contact->displayName().' called your private line')
            ->data([
                'url' => '/line/calls',
                'call_id' => $this->call->id,
            ])
            ->playSound();
    }
}
