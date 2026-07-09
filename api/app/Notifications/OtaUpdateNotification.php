<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

/**
 * Tells the devices that a new over-the-air update was published — opening
 * the app downloads it, and the next launch applies it.
 */
class OtaUpdateNotification extends Notification
{
    public function __construct(
        private readonly ?string $message,
        private readonly ?string $channel,
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
        $body = trim((string) $this->message) !== ''
            ? trim((string) $this->message)
            : 'A new version is ready.';

        if ($this->channel !== null && $this->channel !== '') {
            $body .= " ({$this->channel})";
        }

        return ExpoMessage::create('Update ready 🚀')
            ->body($body.' Open the app twice to apply it.')
            ->playSound();
    }
}
