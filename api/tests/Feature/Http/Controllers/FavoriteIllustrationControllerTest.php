<?php

use App\AI\ChatAgent;
use App\Events\ChatMessageUpdated;
use App\Models\Assistant;
use App\Models\FavoriteIllustration;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;

function illustratedReplyFor(User $user): array
{
    Storage::fake('s3');
    Storage::fake('public');
    fakeImageGeneration();
    Event::fake([ChatMessageUpdated::class]);

    $assistant = Assistant::factory()->create([
        'kind' => Assistant::KIND_ILLUSTRATOR,
        'members' => array_values(array_filter([$user->family_member])),
    ]);

    $conversation = test()->actingAs($user)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Regina con un globo',
            'members' => ['regina'],
        ])
        ->assertCreated()
        ->json('data');

    return [$conversation['id'], $conversation['messages'][1]['id']];
}

it('keeps an illustration by copying it out of the chat message', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    [$conversationId, $messageId] = illustratedReplyFor($alfonso);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.illustration-favorites.store'), ['chat_message_id' => $messageId])
        ->assertCreated();

    expect($response->json('data.prompt'))->toBe('Regina con un globo');
    expect($response->json('data.members'))->toBe(['regina']);
    expect($response->json('data.url'))->not->toBeNull();

    // The favorite survives deleting the conversation it came from.
    $this->actingAs($alfonso)
        ->deleteJson(route('api.conversations.destroy', ['conversation' => $conversationId]))
        ->assertOk();

    $favorite = FavoriteIllustration::findOrFail($response->json('data.id'));
    expect($favorite->getFirstMediaUrl('image'))->not->toBe('');
});

it('is idempotent per message', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    [, $messageId] = illustratedReplyFor($alfonso);

    $first = $this->actingAs($alfonso)
        ->postJson(route('api.illustration-favorites.store'), ['chat_message_id' => $messageId])
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($alfonso)
        ->postJson(route('api.illustration-favorites.store'), ['chat_message_id' => $messageId])
        ->assertOk()
        ->assertJsonPath('data.id', $first);

    expect(FavoriteIllustration::count())->toBe(1);
});

it('rejects a message without an illustration', function () {
    ChatAgent::fake(['Hola']);
    Event::fake([ChatMessageUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $assistant = Assistant::factory()->create(['members' => ['alfonso']]);

    $messageId = $this->actingAs($alfonso)
        ->postJson(route('api.conversations.store'), [
            'assistant_id' => $assistant->id,
            'content' => 'Hola',
        ])
        ->json('data.messages.1.id');

    $this->actingAs($alfonso)
        ->postJson(route('api.illustration-favorites.store'), ['chat_message_id' => $messageId])
        ->assertUnprocessable();
});

it('cannot keep an illustration from someone else\'s conversation', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    [, $messageId] = illustratedReplyFor($alfonso);

    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)
        ->postJson(route('api.illustration-favorites.store'), ['chat_message_id' => $messageId])
        ->assertForbidden();
});

it('lists the collection newest first and deletes from it', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $older = FavoriteIllustration::factory()->create(['user_id' => $alfonso->id, 'prompt' => 'older']);
    $newer = FavoriteIllustration::factory()->create(['user_id' => $alfonso->id, 'prompt' => 'newer']);
    FavoriteIllustration::factory()->create(); // someone else's

    $response = $this->actingAs($alfonso)
        ->getJson(route('api.illustration-favorites.index'))
        ->assertOk();

    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('data.0.id'))->toBe($newer->id);

    $this->actingAs($alfonso)
        ->deleteJson(route('api.illustration-favorites.destroy', ['favoriteIllustration' => $older]))
        ->assertOk();

    expect(FavoriteIllustration::whereKey($older->id)->exists())->toBeFalse();
});

it('cannot delete someone else\'s favorite', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $saida = User::factory()->create(['family_member' => 'saida']);
    $favorite = FavoriteIllustration::factory()->create(['user_id' => $alfonso->id]);

    $this->actingAs($saida)
        ->deleteJson(route('api.illustration-favorites.destroy', ['favoriteIllustration' => $favorite]))
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->getJson(route('api.illustration-favorites.index'))->assertUnauthorized();
});
