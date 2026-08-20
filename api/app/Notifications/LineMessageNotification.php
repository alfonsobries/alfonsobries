<?php

namespace App\Notifications;

use App\Models\LineMessage;
use App\Services\Line\OtpExtractor;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

/**
 * An SMS arrived on the private line. Verification codes get surfaced in
 * the notification body so they can be read without opening the app. The
 * category id enables the reply-from-notification action the app registers.
 */
class LineMessageNotification extends Notification
{
    public const CATEGORY = 'line-message';

    public function __construct(
        private readonly LineMessage $message,
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
        $contact = $this->message->contact;
        $otp = OtpExtractor::extract($this->message->body);

        $body = $otp === null
            ? Str::limit($this->message->body, 150)
            : "Code: {$otp}";

        return ExpoMessage::create($contact->displayName())
            ->body($body)
            ->categoryId(self::CATEGORY)
            ->data([
                'url' => '/line/thread?contact='.$contact->id,
                'contact_id' => $contact->id,
            ])
            ->playSound();
    }
}
