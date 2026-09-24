<?php

namespace App\Console\Commands;

use App\Services\Telegram\TelegramHomeBot;
use Illuminate\Console\Command;

class SetTelegramHomeWebhook extends Command
{
    protected $signature = 'telegram:home-webhook';

    protected $description = 'Point the home assistant Telegram bot at this API';

    public function handle(TelegramHomeBot $bot): int
    {
        $secret = (string) config('services.telegram-home.webhook_secret');

        if (! $bot->configured() || $secret === '') {
            $this->error('Set TELEGRAM_HOME_BOT_TOKEN and TELEGRAM_HOME_WEBHOOK_SECRET first.');

            return self::FAILURE;
        }

        $url = route('api.telegram.home.webhook');

        $bot->setWebhook($url, $secret);

        $this->info("Webhook set to {$url} for @{$bot->username()}.");

        return self::SUCCESS;
    }
}
