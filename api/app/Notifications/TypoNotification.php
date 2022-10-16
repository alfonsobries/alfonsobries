<?php

namespace App\Notifications;

use App\Models\Article;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Telegram\TelegramMessage;

class TypoNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(public Article $article, public string $message, public ?string $excerpt = null)
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
        $message = (new MailMessage)
                    ->subject($this->subject())
                    ->greeting($this->subject())
                    ->line($this->getHtmlableLine('<strong>Article Title:</strong> '.$this->article->title))
                    ->line($this->getHtmlableLine('<strong>Article Slug:</strong> '.$this->article->slug))
                    ->line($this->getHtmlableLine('<strong>Message:</strong>'))
                    ->line($this->getHtmlableLine(nl2br($this->message)));

        if ($this->excerpt) {
            $message->line($this->getHtmlableLine('<strong>Message:</strong>'))
                ->line($this->getHtmlableLine(nl2br($this->message)));
        }

        return $message->action('Edit Article', $this->editUrl())
                    ->line($this->getHtmlableLine(sprintf('<p style="text-align: center"><a href="%s">View Article</a></p>', $this->viewUrl())));
    }

    public function subject(): string
    {
        return sprintf('Typo on article: %s (%s)', $this->article->title, $this->article->slug);
    }

    public function editUrl(): string
    {
        return url(sprintf('nova/resources/articles/%s/edit', $this->article->id));
    }

    public function viewUrl(): string
    {
        return sprintf('%s/posts/%s', config('site.site_url'), $this->article->slug);
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
                'excerpt' => $this->excerpt,
                'articleSlug' => $this->article->slug,
                'message' => $this->message,
            ],
        ];
    }

    public function toTelegram($notifiable)
    {
        $markdown = <<<'MARKDOWN'
*%s*

*Message:*
%s

*Excerpt:*
%s
MARKDOWN;

        return TelegramMessage::create()
            ->to(config('services.telegram-bot-api.chat_id'))
            ->content(sprintf($markdown, $this->subject(), $this->message, $this->excerpt ?? '**No excerpt provided**'))
            ->button('View Article', $this->viewUrl())
            ->button('Edit Article', $this->editUrl());
    }
}
