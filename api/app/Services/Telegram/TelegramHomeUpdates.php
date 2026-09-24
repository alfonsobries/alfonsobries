<?php

namespace App\Services\Telegram;

use App\Models\BehaviorIllustration;
use App\Models\HomeMessage;
use App\Models\User;
use App\Services\HomeMessenger;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Turns an incoming Telegram update into a home chat turn: link a chat to a
 * person through the app's one-time code, then route their texts, photos and
 * voice notes through the same pipeline the app uses.
 */
class TelegramHomeUpdates
{
    private const LINK_CODE_TTL_MINUTES = 15;

    public function __construct(
        private readonly TelegramHomeBot $bot,
        private readonly HomeMessenger $messenger,
    ) {}

    /**
     * A one-time code the app turns into a t.me deep link.
     */
    public static function issueLinkCode(User $user): string
    {
        $code = Str::random(32);

        Cache::put(self::codeKey($code), $user->id, now()->addMinutes(self::LINK_CODE_TTL_MINUTES));

        return $code;
    }

    /**
     * @param  array<string, mixed>  $update
     */
    public function handle(array $update): void
    {
        $message = $update['message'] ?? null;

        // Private chats only: the bot is personal, never a group member.
        if (! is_array($message) || ($message['chat']['type'] ?? null) !== 'private') {
            return;
        }

        $chatId = (int) $message['chat']['id'];
        $text = trim((string) ($message['text'] ?? $message['caption'] ?? ''));

        if (preg_match('/^\/start(?:@\w+)?(?:\s+(\S+))?$/', $text, $matches) === 1) {
            $this->start($chatId, $message, $matches[1] ?? null);

            return;
        }

        $user = User::where('telegram_chat_id', $chatId)->first();

        if ($user === null) {
            $this->bot->sendMessage($chatId, 'Hola 👋 Para usarme, abre la app y ve a <b>Ajustes → Telegram</b> para conectar tu cuenta.');

            return;
        }

        if (preg_match('/^\/desvincular(?:@\w+)?$/', $text) === 1) {
            $user->update(['telegram_chat_id' => null, 'telegram_username' => null]);
            $this->bot->sendMessage($chatId, 'Listo, desconecté esta cuenta. Puedes volver a conectarla desde la app cuando quieras.');

            return;
        }

        $this->forward($user, $chatId, $message, $text);
    }

    /**
     * @param  array<string, mixed>  $message
     */
    private function start(int $chatId, array $message, ?string $code): void
    {
        $userId = $code === null ? null : Cache::pull(self::codeKey($code));
        $user = $userId === null ? null : User::find($userId);

        if ($user === null) {
            $linked = User::where('telegram_chat_id', $chatId)->exists();

            $this->bot->sendMessage($chatId, $linked
                ? 'Aquí estoy 👋 Cuéntame qué gastaste: <i>"50 de café con la amex"</i>, una foto del ticket o una nota de voz.'
                : 'Hola 👋 Para usarme, abre la app y ve a <b>Ajustes → Telegram</b> para conectar tu cuenta. El enlace de la app caduca en '.self::LINK_CODE_TTL_MINUTES.' minutos.');

            return;
        }

        // One chat, one person: a chat moving to someone else frees the old link.
        User::where('telegram_chat_id', $chatId)->whereKeyNot($user->id)->update(['telegram_chat_id' => null, 'telegram_username' => null]);

        $user->update([
            'telegram_chat_id' => $chatId,
            'telegram_username' => $message['from']['username'] ?? null,
        ]);

        $name = ucfirst((string) $user->family_member);

        $this->bot->sendMessage($chatId, "¡Listo, {$name}! 🎉 Ya estamos conectados.\n\nMándame tus gastos como quieras: <i>\"gasté 120 en el súper con la de débito\"</i>, una foto del ticket o una nota de voz. También puedes preguntarme <i>\"¿cuánto llevamos este mes?\"</i>");
    }

    /**
     * @param  array<string, mixed>  $message
     */
    private function forward(User $user, int $chatId, array $message, string $text): void
    {
        $images = [];
        $audio = null;
        $duration = null;

        /** @var list<array{file_id: string, file_size?: int}> $photos */
        $photos = $message['photo'] ?? [];
        $photo = collect($photos)->sortByDesc('file_size')->first();

        if (is_array($photo)) {
            $images[] = $this->store($photo['file_id'], 'jpg');
        } elseif (str_starts_with((string) ($message['document']['mime_type'] ?? ''), 'image/')) {
            $images[] = $this->store($message['document']['file_id'], Str::afterLast((string) $message['document']['mime_type'], '/'));
        }

        $voice = $message['voice'] ?? $message['audio'] ?? null;

        if (is_array($voice)) {
            $audio = $this->store($voice['file_id'], 'ogg');
            $duration = isset($voice['duration']) ? (int) $voice['duration'] * 1000 : null;
        }

        if ($text === '' && $images === [] && $audio === null) {
            $this->bot->sendMessage($chatId, 'Por ahora entiendo texto, fotos y notas de voz 🙂');

            return;
        }

        $this->bot->typing($chatId);

        $this->messenger->send(
            $user,
            $text !== '' ? $text : null,
            $images,
            $audio,
            $duration,
            HomeMessage::SOURCE_TELEGRAM,
            'telegram:'.$chatId.':'.($message['message_id'] ?? Str::uuid7()),
            $chatId,
        );
    }

    private function store(string $fileId, string $extension): string
    {
        $path = 'temp/telegram/'.Str::uuid7().'.'.$extension;

        Storage::disk(BehaviorIllustration::DISK)->put($path, $this->bot->download($fileId));

        return $path;
    }

    private static function codeKey(string $code): string
    {
        return 'telegram-home:link:'.$code;
    }
}
