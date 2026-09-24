<?php

namespace App\Http\Controllers;

use App\Services\Telegram\TelegramHomeBot;
use App\Services\Telegram\TelegramHomeUpdates;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class TelegramLinkController extends Controller
{
    public function __construct(
        private readonly TelegramHomeBot $bot,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $this->authorize('useHome');

        return response()->json(['data' => $this->present($request)]);
    }

    /**
     * A t.me deep link carrying a one-time code; opening it and tapping
     * "Start" links the chat to whoever asked.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('useHome');

        try {
            $username = $this->bot->username();
        } catch (Throwable $exception) {
            report($exception);
            $username = null;
        }

        if ($username === null) {
            return response()->json(['message' => __('home.telegram_unavailable')], 503);
        }

        $code = TelegramHomeUpdates::issueLinkCode($request->user());

        return response()->json([
            'data' => [
                ...$this->present($request),
                'url' => "https://t.me/{$username}?start={$code}",
            ],
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $this->authorize('useHome');

        $request->user()->update(['telegram_chat_id' => null, 'telegram_username' => null]);

        return response()->json(['data' => $this->present($request)]);
    }

    /**
     * @return array{linked: bool, username: string|null}
     */
    private function present(Request $request): array
    {
        return [
            'linked' => $request->user()->telegram_chat_id !== null,
            'username' => $request->user()->telegram_username,
        ];
    }
}
