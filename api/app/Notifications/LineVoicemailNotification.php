<?php

namespace App\Notifications;

use App\Models\LineVoicemail;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

/**
 * A voicemail landed; the transcript snippet means the message can be read
 * from the lock screen before deciding whether to call back.
 */
class LineVoicemailNotification extends Notification
{
    public function __construct(
        private readonly LineVoicemail $voicemail,
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
        $transcript = trim((string) $this->voicemail->transcript);

        $body = $transcript === ''
            ? 'New voicemail on your private line'
            : Str::limit($transcript, 150);

        return ExpoMessage::create('Voicemail from '.$this->voicemail->contact->displayName())
            ->body($body)
            ->data([
                'url' => '/line/voicemail',
                'voicemail_id' => $this->voicemail->id,
            ])
            ->playSound();
    }
}
