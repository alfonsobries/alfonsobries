<?php

use App\AI\ChatAgent;
use App\Events\ChatMessageUpdated;
use App\Jobs\GenerateChatReply;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;

it('appends a message and receives the assistant reply', function () {
    ChatAgent::fake(['Claro que sí']);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $conversation = Conversation::factory()->create(['user_id' => $alfonso->id]);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.messages.store', ['conversation' => $conversation]), [
            'content' => '¿Me ayudas?',
        ])
        ->assertCreated();

    expect($response->json('data.user_message.content'))->toBe('¿Me ayudas?');
    expect($response->json('data.reply.status'))->toBe(ChatMessage::STATUS_COMPLETED);
    expect($response->json('data.reply.content'))->toBe('Claro que sí');
});

it('sends the prior transcript as conversation history', function () {
    ChatAgent::fake(['Second reply']);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $conversation = Conversation::factory()->create(['user_id' => $alfonso->id]);
    ChatMessage::factory()->create(['conversation_id' => $conversation->id, 'content' => 'First question']);
    ChatMessage::factory()->assistant()->create(['conversation_id' => $conversation->id, 'content' => 'First reply']);

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.messages.store', ['conversation' => $conversation]), [
            'content' => 'Second question',
        ])
        ->assertCreated();

    ChatAgent::assertPrompted(function ($prompt): bool {
        $history = collect($prompt->agent->messages());

        return $history->count() === 2
            && $history->first()->content === 'First question'
            && $prompt->prompt === 'Second question';
    });
});

it('attaches uploaded images to the message', function () {
    Storage::fake('s3');
    Storage::fake('public');
    Storage::disk('s3')->put(
        'temp/uploads/photo.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
    );

    ChatAgent::fake(['Nice photo']);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $conversation = Conversation::factory()->create(['user_id' => $alfonso->id]);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.messages.store', ['conversation' => $conversation]), [
            'content' => 'Translate the sign in this photo',
            'image_paths' => ['temp/uploads/photo.png'],
        ])
        ->assertCreated();

    expect($response->json('data.user_message.attachments'))->toHaveCount(1);
});

it('marks the reply failed when generation blows up', function () {
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $conversation = Conversation::factory()->create(['user_id' => $alfonso->id]);
    $reply = ChatMessage::factory()->pending()->create(['conversation_id' => $conversation->id]);

    (new GenerateChatReply($reply))->failed(new RuntimeException('model unavailable'));

    expect($reply->fresh()->status)->toBe(ChatMessage::STATUS_FAILED);
    expect($reply->fresh()->error)->toBe('model unavailable');
    Event::assertDispatched(ChatMessageUpdated::class);
});

it('shows a single message for polling', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $conversation = Conversation::factory()->create(['user_id' => $alfonso->id]);
    $message = ChatMessage::factory()->pending()->create(['conversation_id' => $conversation->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.chat-messages.show', ['chatMessage' => $message]))
        ->assertOk()
        ->assertJsonPath('data.status', ChatMessage::STATUS_PENDING);
});

it('hides messages from other people conversations', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $saida = User::factory()->create(['family_member' => 'saida']);
    $conversation = Conversation::factory()->create(['user_id' => $saida->id]);
    $message = ChatMessage::factory()->create(['conversation_id' => $conversation->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.chat-messages.show', ['chatMessage' => $message]))
        ->assertForbidden();

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.messages.store', ['conversation' => $conversation]), ['content' => 'Hola'])
        ->assertForbidden();
});

it('requires text or an image', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $conversation = Conversation::factory()->create(['user_id' => $alfonso->id]);

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.messages.store', ['conversation' => $conversation]), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['content']);
});

it('requires authentication', function () {
    $conversation = Conversation::factory()->create();

    $this->postJson(route('api.conversations.messages.store', ['conversation' => $conversation]), ['content' => 'Hola'])
        ->assertUnauthorized();
});
