<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Notification;
use NotificationChannels\Expo\ExpoChannel;
use NotificationChannels\Expo\ExpoMessage;

/**
 * Tells each parent the house switched its air conditioners off because
 * neither of them was near, or back on because one of them returned.
 */
class ClimateAutomationNotification extends Notification
{
    /** The language the household reads notifications in. */
    private const LOCALE = 'es';

    public function __construct(
        public readonly bool $switchedOn,
        public readonly int $count,
        private readonly ?User $arrived = null,
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
        return ExpoMessage::create($this->title())->body($this->body($notifiable));
    }

    public function title(): string
    {
        return __($this->switchedOn ? 'climate.switched_on_title' : 'climate.switched_off_title', [], self::LOCALE);
    }

    public function body(object $notifiable): string
    {
        if (! $this->switchedOn) {
            return trans_choice('climate.switched_off_body', $this->count, [
                'count' => $this->count,
                'other' => $this->otherParentName($notifiable),
            ], self::LOCALE);
        }

        if ($this->arrived !== null && $notifiable instanceof User && $this->arrived->is($notifiable)) {
            return trans_choice('climate.switched_on_body_self', $this->count, ['count' => $this->count], self::LOCALE);
        }

        return trans_choice('climate.switched_on_body', $this->count, [
            'count' => $this->count,
            'name' => $this->firstName($this->arrived),
        ], self::LOCALE);
    }

    private function otherParentName(object $notifiable): string
    {
        $other = User::query()
            ->whereIn('family_member', User::MOOD_MEMBERS)
            ->when($notifiable instanceof User, fn ($query) => $query->whereKeyNot($notifiable->getKey()))
            ->first();

        return $this->firstName($other);
    }

    private function firstName(?User $user): string
    {
        return $user !== null ? (string) strtok((string) $user->name, ' ') : __('climate.someone', [], self::LOCALE);
    }
}
