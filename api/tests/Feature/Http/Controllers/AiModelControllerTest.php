<?php

use App\AI\ModelCatalog;
use App\Models\User;

it('lists chat and image models cheapest first with the active one', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $response = $this->actingAs($alfonso)
        ->getJson(route('api.ai-models.index'))
        ->assertOk();

    $chat = $response->json('data.chat');
    $image = $response->json('data.image');

    expect($chat['active'])->toBe('gpt-5-1');
    expect($image['active'])->toBe('gpt-image-2-low');

    $chatIds = array_column($chat['models'], 'id');
    expect($chatIds[0])->toBe('gpt-5-mini');
    expect($chatIds)->toContain('claude-haiku-4-5', 'claude-sonnet-5');

    $imageIds = array_column($image['models'], 'id');
    expect($imageIds[0])->toBe('gpt-image-2-low');
    expect($imageIds)->toContain('grok-imagine');

    // The human-readable comparison the picker renders.
    expect($chat['models'][0])->toHaveKeys(['label', 'cost', 'blurb', 'recommended']);
});

it('switches the active model per kind', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.ai-models.update'), ['kind' => 'image', 'id' => 'grok-imagine'])
        ->assertOk()
        ->assertJsonPath('data.image.active', 'grok-imagine')
        ->assertJsonPath('data.chat.active', 'gpt-5-1');

    expect(ModelCatalog::active('image')['provider'])->toBe('xai');
});

it('rejects an unknown model', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->putJson(route('api.ai-models.update'), ['kind' => 'chat', 'id' => 'gpt-99'])
        ->assertUnprocessable();
});

it('is only available to alfonso', function () {
    $saida = User::factory()->create(['family_member' => 'saida']);

    $this->actingAs($saida)
        ->getJson(route('api.ai-models.index'))
        ->assertForbidden();

    $this->actingAs($saida)
        ->putJson(route('api.ai-models.update'), ['kind' => 'chat', 'id' => 'gpt-5-mini'])
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->getJson(route('api.ai-models.index'))->assertUnauthorized();
});
