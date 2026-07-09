<?php

use App\Events\BehaviorIllustrationUpdated;
use App\Jobs\GenerateBehaviorIllustration;
use App\Models\BehaviorIllustration;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

it('generates an illustration and stores it in temp storage', function () {
    Storage::fake('s3')->buildTemporaryUrlsUsing(fn (string $path): string => "https://s3.test/{$path}");
    fakeImageGeneration();
    Event::fake([BehaviorIllustrationUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => 'Shouting', 'family_member' => 'regina'])
        ->assertCreated();

    // The sync test queue runs the generation inline, so it's already done.
    expect($response->json('data.status'))->toBe(BehaviorIllustration::STATUS_COMPLETED);
    expect($response->json('data.path'))->toStartWith('temp/behavior-illustrations/');
    expect($response->json('data.url'))->not->toBeNull();

    Http::assertSent(fn ($request): bool => str_contains(sentImagePrompt($request), 'Shouting'));
});

it('draws the kid the behavior belongs to', function () {
    Storage::fake('s3');
    fakeImageGeneration();
    Event::fake([BehaviorIllustrationUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => 'Tantrum', 'family_member' => 'andres'])
        ->assertCreated();

    Http::assertSent(
        fn ($request): bool => str_contains(sentImagePrompt($request), 'Andrés')
            && str_contains(sentImagePrompt($request), 'Main character: Andrés'),
    );
});

it('broadcasts when the generation completes', function () {
    Storage::fake('s3');
    fakeImageGeneration();
    Event::fake([BehaviorIllustrationUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => 'Shouting', 'family_member' => 'regina'])
        ->assertCreated();

    Event::assertDispatched(
        BehaviorIllustrationUpdated::class,
        fn (BehaviorIllustrationUpdated $event): bool => $event->illustration->id === $response->json('data.id')
            && $event->broadcastOn()[0]->name === 'private-behavior-illustration.'.$response->json('data.id'),
    );
});

it('broadcasts when the generation fails', function () {
    Event::fake([BehaviorIllustrationUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $illustration = BehaviorIllustration::factory()->create(['user_id' => $alfonso->id]);

    (new GenerateBehaviorIllustration($illustration))->failed(new RuntimeException('no access to model'));

    expect($illustration->fresh()->status)->toBe(BehaviorIllustration::STATUS_FAILED);
    Event::assertDispatched(BehaviorIllustrationUpdated::class);
});

it('sends the style guide with every generation', function () {
    Storage::fake('s3');
    fakeImageGeneration();
    Event::fake([BehaviorIllustrationUpdated::class]);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => 'Hitting', 'family_member' => 'regina'])
        ->assertCreated();

    Http::assertSent(fn ($request): bool => str_contains(sentImagePrompt($request), 'hand-drawn illustration'));
});

it('shows a pending illustration while it is still generating', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $illustration = BehaviorIllustration::factory()->create(['user_id' => $alfonso->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.behavior-illustrations.show', ['behaviorIllustration' => $illustration]))
        ->assertOk()
        ->assertJson([
            'data' => [
                'status' => BehaviorIllustration::STATUS_PENDING,
                'path' => null,
                'url' => null,
            ],
        ]);
});

it('reports a failed generation', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $illustration = BehaviorIllustration::factory()->failed()->create(['user_id' => $alfonso->id]);

    $this->actingAs($alfonso)
        ->getJson(route('api.behavior-illustrations.show', ['behaviorIllustration' => $illustration]))
        ->assertOk()
        ->assertJsonPath('data.status', BehaviorIllustration::STATUS_FAILED)
        ->assertJsonPath('data.error', 'Generation failed.');
});

it('validates the illustration payload', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => '', 'family_member' => 'saida'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'family_member']);
});

it('forbids a non family member from generating illustrations', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => 'Shouting', 'family_member' => 'regina'])
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->postJson(route('api.behavior-illustrations.store'), ['name' => 'Shouting', 'family_member' => 'regina'])
        ->assertUnauthorized();
});
