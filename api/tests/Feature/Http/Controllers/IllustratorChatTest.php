<?php

use App\AI\ChatAgent;
use App\Events\ChatMessageUpdated;
use App\Models\Assistant;
use App\Models\ChatMessage;
use App\Models\User;
use App\Notifications\IllustrationReadyNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

function illustratorAssistant(): Assistant
{
    return Assistant::factory()->create([
        'kind' => Assistant::KIND_ILLUSTRATOR,
        'slug' => 'illustrator',
        'members' => ['alfonso', 'saida'],
    ]);
}

it('replies with a generated illustration featuring the picked members', function () {
    Storage::fake('s3');
    Storage::fake('public');
    fakeImageGeneration();
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = illustratorAssistant();

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Jugando con bloques en la sala',
            'members' => ['regina', 'andres'],
        ])
        ->assertCreated();

    expect($response->json('data.members'))->toBe(['regina', 'andres']);
    expect($response->json('data.assistant.kind'))->toBe(Assistant::KIND_ILLUSTRATOR);

    // The sync test queue generates the reply inline, so it's already done.
    $reply = $response->json('data.messages.1');
    expect($reply['role'])->toBe(ChatMessage::ROLE_ASSISTANT);
    expect($reply['status'])->toBe(ChatMessage::STATUS_COMPLETED);
    expect($reply['content'])->toBeNull();
    expect($reply['attachments'])->toHaveCount(1);

    Http::assertSent(function ($request): bool {
        $prompt = sentImagePrompt($request);

        return str_contains($prompt, 'Main character: Regina')
            && str_contains($prompt, 'Main character: Andrés')
            && str_contains($prompt, 'Feature Regina and Andrés TOGETHER')
            && str_contains($prompt, 'magenta #FF00FF')
            && str_contains($prompt, 'Jugando con bloques en la sala');
    });
});

it('turns a follow-up message into an edit of the previous illustration', function () {
    Storage::fake('s3');
    Storage::fake('public');
    fakeImageGeneration();
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = illustratorAssistant();

    $conversationId = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Regina con un globo',
            'members' => ['regina'],
        ])
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.messages.store', ['conversation' => $conversationId]), [
            'content' => 'ahora el globo es rojo',
        ])
        ->assertCreated();

    Http::assertSent(function ($request): bool {
        $prompt = sentImagePrompt($request);

        return str_contains($prompt, 'This is a follow-up edit.')
            && str_contains($prompt, 'ahora el globo es rojo');
    });
});

it('draws without characters when no members are picked', function () {
    Storage::fake('s3');
    Storage::fake('public');
    fakeImageGeneration();
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = illustratorAssistant();

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'un cohete espacial',
        ])
        ->assertCreated();

    Http::assertSent(function ($request): bool {
        $prompt = sentImagePrompt($request);

        return str_contains($prompt, 'ONLY as a reference for line style and palette')
            && ! str_contains($prompt, 'Main character:');
    });
});

it('notifies the requester when the illustration is ready', function () {
    Storage::fake('s3');
    Storage::fake('public');
    fakeImageGeneration();
    Event::fake([ChatMessageUpdated::class]);
    Notification::fake();

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = illustratorAssistant();

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Regina con un globo',
            'members' => ['regina'],
        ])
        ->assertCreated();

    Notification::assertSentTo(
        $alfonso,
        IllustrationReadyNotification::class,
        fn (IllustrationReadyNotification $notification): bool => $notification->toExpo($alfonso)->toArray()['body'] === 'Regina con un globo',
    );
});

it('does not notify for regular chat replies', function () {
    ChatAgent::fake(['Hola']);
    Event::fake([ChatMessageUpdated::class]);
    Notification::fake();

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = Assistant::factory()->create(['members' => ['alfonso']]);

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Hola',
        ])
        ->assertCreated();

    Notification::assertNothingSent();
});

it('rejects unknown members', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = illustratorAssistant();

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'algo',
            'members' => ['batman'],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['members.0']);
});

it('ignores members on regular chat assistants', function () {
    ChatAgent::fake(['Hola']);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = Assistant::factory()->create(['members' => ['alfonso']]);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Hola',
            'members' => ['regina'],
        ])
        ->assertCreated();

    expect($response->json('data.members'))->toBeNull();
});

it('marks the reply failed when the provider errors', function () {
    Storage::fake('s3');
    Storage::fake('public');
    config(['images.providers.openai.api_key' => 'test-key']);
    Http::fake(['*/images/edits' => Http::response(['error' => ['message' => 'model overloaded']], 500)]);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = illustratorAssistant();

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'algo imposible',
            'members' => ['regina'],
        ])
        ->assertCreated();

    expect($response->json('data.messages.1.status'))->toBe(ChatMessage::STATUS_FAILED);
});
