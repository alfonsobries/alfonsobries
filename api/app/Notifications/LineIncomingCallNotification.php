<?php

namespace App\Notifications;

use App\Models\LineCall;
use Illuminate\Notifications\Notification;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

/**
 * The line is ringing right now — the closest the API allows to a real
 * incoming-call alert, so it ships at high priority with sound.
 */
class LineIncomingCallNotification extends Notification
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
        return ExpoMessage::create('📞 Incoming call')
            ->body($this->call->contact->displayName().' is calling your private line')
            ->data([
                'url' => '/line/incoming?call='.$this->call->id,
                'call_id' => $this->call->id,
            ])
            ->high()
            ->playSound();
    }
}
