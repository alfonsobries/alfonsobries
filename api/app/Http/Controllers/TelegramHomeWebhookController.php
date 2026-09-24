<?php

namespace App\Http\Controllers;

use App\Services\Telegram\TelegramHomeUpdates;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Throwable;

class TelegramHomeWebhookController extends Controller
{
    /**
     * Telegram's push for the home bot. Always answers 200 once the secret
     * checks out: anything else makes Telegram redeliver the same update.
     */
    public function __invoke(Request $request, TelegramHomeUpdates $updates): Response
    {
        $secret = (string) config('services.telegram-home.webhook_secret');

        if ($secret === '' || ! hash_equals($secret, (string) $request->header('X-Telegram-Bot-Api-Secret-Token'))) {
            return response('Forbidden', 403);
        }

        $updateId = $request->integer('update_id');

        // Telegram redelivers when a response is slow; handle each update once.
        if (! Cache::add('telegram-home:update:'.$updateId, true, now()->addDay())) {
            return response('OK');
        }

        try {
            $updates->handle($request->all());
        } catch (Throwable $exception) {
            report($exception);
        }

        return response('OK');
    }
}
