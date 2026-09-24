<?php

namespace App\Services\Telegram;

use App\Models\Expense;
use App\Models\HomeMessage;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

/**
 * The home assistant's Telegram bot, over the plain Bot API: a handful of
 * calls doesn't warrant a framework.
 */
class TelegramHomeBot
{
    private const API = 'https://api.telegram.org';

    public function configured(): bool
    {
        return filled(config('services.telegram-home.token'));
    }

    /**
     * The bot's @username, for the t.me deep link. Cached: it only changes if
     * the bot is renamed in BotFather.
     */
    public function username(): ?string
    {
        if (! $this->configured()) {
            return null;
        }

        return Cache::remember('telegram-home:username', now()->addDay(), function (): ?string {
            return $this->call('getMe')['username'] ?? null;
        });
    }

    public function sendMessage(int $chatId, string $html): void
    {
        $this->call('sendMessage', [
            'chat_id' => $chatId,
            'text' => $html,
            'parse_mode' => 'HTML',
            'link_preview_options' => ['is_disabled' => true],
        ]);
    }

    /**
     * "typing…" under the bot's name while the answer is worked out.
     */
    public function typing(int $chatId): void
    {
        try {
            $this->call('sendChatAction', ['chat_id' => $chatId, 'action' => 'typing']);
        } catch (Throwable) {
            // Cosmetic only.
        }
    }

    /**
     * The bytes of a file someone sent the bot (a photo or a voice note).
     */
    public function download(string $fileId): string
    {
        $path = $this->call('getFile', ['file_id' => $fileId])['file_path'] ?? null;

        if (! is_string($path)) {
            throw new RuntimeException('Telegram did not return a file path.');
        }

        return $this->http()
            ->get(self::API.'/file/bot'.config('services.telegram-home.token').'/'.$path)
            ->throw()
            ->body();
    }

    public function setWebhook(string $url, string $secret): void
    {
        $this->call('setWebhook', [
            'url' => $url,
            'secret_token' => $secret,
            'allowed_updates' => ['message'],
            'drop_pending_updates' => true,
        ]);

        $this->call('setMyCommands', [
            'commands' => [
                ['command' => 'start', 'description' => 'Cómo usar el bot'],
                ['command' => 'desvincular', 'description' => 'Desconectar esta cuenta de Telegram'],
            ],
        ]);
    }

    /**
     * Send a settled home reply back to the Telegram chat it came from, with a
     * line per expense it touched (the app shows cards; here, text).
     */
    public function deliver(HomeMessage $reply): void
    {
        if ($reply->telegram_chat_id === null || $reply->isPending() || ! $this->configured()) {
            return;
        }

        if (! $reply->isCompleted()) {
            $this->sendMessage($reply->telegram_chat_id, 'No pude procesar eso 😕 Intenta de nuevo en un momento.');

            return;
        }

        $reply->loadMissing(['expenses.category', 'expenses.account']);

        $lines = $reply->expenses->map(fn (Expense $expense): string => $this->expenseLine($expense));
        $text = trim(e($reply->content ?? '')."\n\n".$lines->implode("\n"));

        $this->sendMessage($reply->telegram_chat_id, $text !== '' ? $text : 'Listo ✅');
    }

    private function expenseLine(Expense $expense): string
    {
        $action = $expense->pivot->action;
        $amount = '$'.number_format((float) $expense->amount, 2).($expense->currency === Expense::DEFAULT_CURRENCY ? '' : ' '.$expense->currency);
        $details = array_filter([
            $expense->category?->name,
            $expense->account?->name,
        ]);

        $line = sprintf(
            '%s <b>%s</b> %s%s',
            $expense->emoji ?? $expense->category->emoji ?? '🪙',
            e($amount),
            e($expense->description),
            $details === [] ? '' : ' · <i>'.e(implode(' · ', $details)).'</i>',
        );

        return $action === 'deleted' ? "<s>{$line}</s>" : $line;
    }

    /**
     * @param  array<string, mixed>  $parameters
     * @return array<string, mixed>
     */
    private function call(string $method, array $parameters = []): array
    {
        $response = $this->http()
            ->post(self::API.'/bot'.config('services.telegram-home.token').'/'.$method, $parameters)
            ->throw()
            ->json();

        return is_array($response['result'] ?? null) ? $response['result'] : [];
    }

    private function http(): PendingRequest
    {
        return Http::timeout(20)->retry(2, 300, throw: false);
    }
}
