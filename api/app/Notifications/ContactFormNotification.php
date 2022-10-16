<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Telegram\TelegramMessage;

class ContactFormNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(public string $name, public string $email, public string $message)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database', 'telegram'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject($this->subject())
                    ->greeting($this->subject())
                    ->line($this->getHtmlableLine('<strong>Name:</strong> '.$this->name))
                    ->line($this->getHtmlableLine('<strong>Email:</strong> '.$this->email))
                    ->line($this->getHtmlableLine('<strong>Message:</strong>'))
                    ->line($this->getHtmlableLine(nl2br($this->message)));
    }

    public function subject(): string
    {
        return 'Alfonso Website Contact Form';
    }

    public function getHtmlableLine($html): Htmlable
    {
        return new class($html) implements Htmlable
        {
            public function __construct(private string $html)
            {
                //
            }

            public function toHtml()
            {
                return $this->html;
            }
        };
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'type' => 'contact-form',
            'data' => [
                'name' => $this->name,
                'email' => $this->email,
                'message' => $this->message,
            ],
        ];
    }

    public function toTelegram($notifiable)
    {
        // // Response is an array of updates.
        // $updates = TelegramUpdates::create()
        //     // (Optional). Get's the latest update. NOTE: All previous updates will be forgotten using this method.
        //     // ->latest()

        //     // (Optional). Limit to 2 updates (By default, updates starting with the earliest unconfirmed update are returned).
        //     // ->limit(2)

        //     // (Optional). Add more params to the request.
        //     ->options([
        //         'timeout' => 0,
        //     ])
        //     ->get();

        // // if($updates['ok']) {
        // //     // Chat ID
        // //     $chatId = $updates['result'][0]['message']['chat']['id'];
        // // }
        // info($updates);
        //

        return TelegramMessage::create()
                    // Optional recipient user id.
                    ->to(config('services.telegram-bot-api.chat_id'))
                    // Markdown supported.
                    ->content(sprintf(<<<'MARKDOWN'
*%s*

*Name:* %s
*Email:* %s
*Message:*
%s
MARKDOWN, $this->subject(), $this->name, $this->email, $this->message));
    }
}
