<?php

use App\Models\BehaviorIllustration;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Image;

it('generates an illustration and stores it in temp storage', function () {
    Storage::fake('s3')->buildTemporaryUrlsUsing(fn (string $path): string => "https://s3.test/{$path}");
    Image::fake();

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => 'Shouting'])
        ->assertCreated();

    // The sync test queue runs the generation inline, so it's already done.
    expect($response->json('data.status'))->toBe(BehaviorIllustration::STATUS_COMPLETED);
    expect($response->json('data.path'))->toStartWith('temp/behavior-illustrations/');
    expect($response->json('data.url'))->not->toBeNull();

    Image::assertGenerated(fn ($generation): bool => str_contains($generation->prompt, 'Shouting'));
});

it('sends the style guide with every generation', function () {
    Storage::fake('s3');
    Image::fake();

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => 'Hitting'])
        ->assertCreated();

    Image::assertGenerated(fn ($generation): bool => str_contains($generation->prompt, 'flat vector illustration'));
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

it('validates the illustration name', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('name');
});

it('forbids a non family member from generating illustrations', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.behavior-illustrations.store'), ['name' => 'Shouting'])
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->postJson(route('api.behavior-illustrations.store'), ['name' => 'Shouting'])
        ->assertUnauthorized();
});
