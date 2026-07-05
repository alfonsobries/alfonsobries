<?php

use App\AI\ChatAgent;
use App\Events\ChatMessageUpdated;
use App\Models\Assistant;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Event;

it('starts a conversation and receives the assistant reply', function () {
    ChatAgent::fake(['Hola, ¿en qué te ayudo?']);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = Assistant::factory()->create(['members' => ['alfonso']]);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Hola',
        ])
        ->assertCreated();

    // The sync test queue generates the reply inline, so it's already done.
    expect($response->json('data.title'))->toBe('Hola');
    expect($response->json('data.messages'))->toHaveCount(2);
    expect($response->json('data.messages.0.role'))->toBe(ChatMessage::ROLE_USER);
    expect($response->json('data.messages.1.role'))->toBe(ChatMessage::ROLE_ASSISTANT);
    expect($response->json('data.messages.1.status'))->toBe(ChatMessage::STATUS_COMPLETED);
    expect($response->json('data.messages.1.content'))->toBe('Hola, ¿en qué te ayudo?');
});

it('broadcasts the reply on the conversation channel', function () {
    ChatAgent::fake(['Done']);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = Assistant::factory()->create(['members' => ['alfonso']]);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Hola',
        ])
        ->assertCreated();

    Event::assertDispatched(
        ChatMessageUpdated::class,
        fn (ChatMessageUpdated $event): bool => $event->broadcastOn()[0]->name === 'private-conversation.'.$response->json('data.id'),
    );
});

it('sends the assistant instructions as the system prompt', function () {
    ChatAgent::fake(['Sure']);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = Assistant::factory()->create([
        'members' => ['alfonso'],
        'instructions' => 'Always answer in haiku.',
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Hola',
        ])
        ->assertCreated();

    ChatAgent::assertPrompted(fn ($prompt): bool => $prompt->agent->instructions() === 'Always answer in haiku.');
});

it('refuses an assistant not assigned to the member', function () {
    $saida = User::factory()->create(['family_member' => 'saida']);
    $assistant = Assistant::factory()->create(['members' => ['alfonso']]);

    $this->actingAs($saida)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Hola',
        ])
        ->assertForbidden();

    expect(Conversation::count())->toBe(0);
});

it('lists only the signed-in user conversations, newest first', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $saida = User::factory()->create(['family_member' => 'saida']);
    $assistant = Assistant::factory()->create();

    $old = Conversation::factory()->create([
        'user_id' => $alfonso->id,
        'assistant_id' => $assistant->id,
        'updated_at' => now()->subDay(),
    ]);
    $recent = Conversation::factory()->create(['user_id' => $alfonso->id, 'assistant_id' => $assistant->id]);
    Conversation::factory()->create(['user_id' => $saida->id, 'assistant_id' => $assistant->id]);

    ChatMessage::factory()->assistant()->create(['conversation_id' => $recent->id, 'content' => 'The last reply']);

    $this->actingAs($alfonso)
        ->getJson(route('api.conversations.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $recent->id)
        ->assertJsonPath('data.0.last_message', 'The last reply')
        ->assertJsonPath('data.1.id', $old->id);
});

it('shows a conversation with its messages', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $conversation = Conversation::factory()->create(['user_id' => $alfonso->id]);
    ChatMessage::factory()->create(['conversation_id' => $conversation->id, 'content' => 'Hola']);
    ChatMessage::factory()->assistant()->create(['conversation_id' => $conversation->id, 'content' => 'Hola!']);

    $this->actingAs($alfonso)
        ->getJson(route('api.conversations.show', ['conversation' => $conversation]))
        ->assertOk()
        ->assertJsonCount(2, 'data.messages')
        ->assertJsonPath('data.messages.0.content', 'Hola')
        ->assertJsonPath('data.messages.1.content', 'Hola!');
});

it('hides other people conversations', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $saida = User::factory()->create(['family_member' => 'saida']);
    $conversation = Conversation::factory()->create(['user_id' => $saida->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.conversations.show', ['conversation' => $conversation]))
        ->assertForbidden();
});

it('deletes a conversation with its messages', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $conversation = Conversation::factory()->create(['user_id' => $alfonso->id]);
    ChatMessage::factory()->create(['conversation_id' => $conversation->id]);

    $this->actingAs($alfonso)
        ->deleteJson(route('api.conversations.destroy', ['conversation' => $conversation]))
        ->assertOk();

    expect(Conversation::count())->toBe(0);
    expect(ChatMessage::count())->toBe(0);
});

it('validates the first message', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), ['assistant_id' => null, 'content' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['assistant_id', 'content']);
});

it('forbids a non family member', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->getJson(route('api.conversations.index'))
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->getJson(route('api.conversations.index'))->assertUnauthorized();
});
