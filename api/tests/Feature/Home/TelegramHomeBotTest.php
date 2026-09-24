<?php

use App\AI\Home\HomeAgent;
use App\Events\ExpensesChanged;
use App\Events\HomeMessageUpdated;
use App\Models\ExpenseCategory;
use App\Models\HomeMessage;
use App\Models\User;
use App\Services\Telegram\TelegramHomeUpdates;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Laravel\Ai\Responses\Data\ToolCall;

beforeEach(function () {
    config([
        'services.telegram-home.token' => 'bot-token',
        'services.telegram-home.webhook_secret' => 'hook-secret',
    ]);

    Event::fake([HomeMessageUpdated::class, ExpensesChanged::class]);

    Http::fake([
        'api.telegram.org/botbot-token/getMe' => Http::response(['ok' => true, 'result' => ['username' => 'casa_bot']]),
        'api.telegram.org/botbot-token/getFile' => Http::response(['ok' => true, 'result' => ['file_path' => 'photos/file_1.jpg']]),
        'api.telegram.org/file/botbot-token/*' => Http::response('image-bytes'),
        'api.telegram.org/*' => Http::response(['ok' => true, 'result' => []]),
    ]);
});

/**
 * @param  array<string, mixed>  $message
 */
function telegramUpdate(array $message, int $updateId = 1, string $secret = 'hook-secret'): TestResponse
{
    return test()->postJson(route('api.telegram.home.webhook'), [
        'update_id' => $updateId,
        'message' => [
            'message_id' => $updateId,
            'chat' => ['id' => 777, 'type' => 'private'],
            'from' => ['id' => 777, 'username' => 'alfonsobries'],
            ...$message,
        ],
    ], ['X-Telegram-Bot-Api-Secret-Token' => $secret]);
}

/**
 * @return list<string>
 */
function sentTelegramTexts(): array
{
    return Http::recorded()
        ->filter(fn (array $pair): bool => str_ends_with($pair[0]->url(), '/sendMessage'))
        ->map(fn (array $pair): string => (string) $pair[0]['text'])
        ->values()
        ->all();
}

it('rejects calls without the webhook secret', function () {
    telegramUpdate(['text' => 'hola'], secret: 'wrong')->assertForbidden();
});

it('links a chat through the one-time code from the app', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $url = $this->actingAs($alfonso)
        ->postJson(route('api.telegram.store'))
        ->assertOk()
        ->json('data.url');

    expect($url)->toStartWith('https://t.me/casa_bot?start=');

    $code = str($url)->after('start=')->toString();

    telegramUpdate(['text' => "/start {$code}"])->assertOk();

    expect($alfonso->fresh()->telegram_chat_id)->toBe(777)
        ->and($alfonso->fresh()->telegram_username)->toBe('alfonsobries')
        ->and(sentTelegramTexts()[0])->toContain('Alfonso');

    // The code is single use.
    $saida = User::factory()->create(['family_member' => 'saida']);
    app(TelegramHomeUpdates::class)->handle([
        'message' => ['chat' => ['id' => 888, 'type' => 'private'], 'text' => "/start {$code}"],
    ]);

    expect($saida->fresh()->telegram_chat_id)->toBeNull();

    $this->actingAs($alfonso->fresh())
        ->getJson(route('api.telegram.show'))
        ->assertJsonPath('data.linked', true);
});

it('points strangers to the app instead of answering them', function () {
    HomeAgent::fake()->preventStrayPrompts();

    telegramUpdate(['text' => 'gasté 50 en café'])->assertOk();

    expect(HomeMessage::count())->toBe(0)
        ->and(sentTelegramTexts()[0])->toContain('Ajustes');
});

it('records an expense sent by text and answers in the chat', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'telegram_chat_id' => 777]);
    $coffee = ExpenseCategory::factory()->create(['emoji' => '☕']);

    HomeAgent::fake([
        new ToolCall('call_1', 'record_expenses', ['items' => [[
            'amount' => 50,
            'description' => 'Café',
            'category_id' => $coffee->id,
        ]]]),
        'Listo ☕',
    ]);

    telegramUpdate(['text' => 'gasté 50 en café'])->assertOk();

    $message = HomeMessage::where('role', HomeMessage::ROLE_USER)->sole();

    expect($message->user_id)->toBe($alfonso->id)
        ->and($message->source)->toBe(HomeMessage::SOURCE_TELEGRAM)
        ->and(sentTelegramTexts()[0])->toContain('Listo ☕')
        ->and(sentTelegramTexts()[0])->toContain('<b>$50.00</b> Café');

    HomeAgent::assertPrompted(fn ($prompt): bool => str_contains($prompt->prompt, 'sent from Telegram'));
});

it('handles each update once even when Telegram redelivers it', function () {
    User::factory()->create(['family_member' => 'alfonso', 'telegram_chat_id' => 777]);
    HomeAgent::fake(['Listo', 'Otra vez']);

    telegramUpdate(['text' => '50 de café'], updateId: 42)->assertOk();
    telegramUpdate(['text' => '50 de café'], updateId: 42)->assertOk();

    expect(HomeMessage::where('role', HomeMessage::ROLE_USER)->count())->toBe(1);
});

it('downloads a receipt photo into the message', function () {
    Storage::fake('s3');
    Storage::fake('public');

    User::factory()->create(['family_member' => 'saida', 'telegram_chat_id' => 777]);
    HomeAgent::fake(['Anotado']);

    telegramUpdate([
        'caption' => 'ticket del súper',
        'photo' => [
            ['file_id' => 'small', 'file_size' => 100],
            ['file_id' => 'large', 'file_size' => 9000],
        ],
    ])->assertOk();

    $message = HomeMessage::where('role', HomeMessage::ROLE_USER)->sole();

    expect($message->getMedia('images'))->toHaveCount(1)
        ->and($message->content)->toBe('ticket del súper');

    Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), '/getFile') && $request['file_id'] === 'large');
});

it('unlinks from the chat', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso', 'telegram_chat_id' => 777]);

    telegramUpdate(['text' => '/desvincular'])->assertOk();

    expect($alfonso->fresh()->telegram_chat_id)->toBeNull();
});
