<?php

use App\Models\Behavior;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('lists the behaviors of a kid', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    Behavior::factory()->create(['family_member' => 'regina', 'name' => 'Shouting', 'points' => 1]);
    Behavior::factory()->create(['family_member' => 'regina', 'name' => 'Hitting', 'points' => 2]);
    Behavior::factory()->create(['family_member' => 'andres', 'name' => 'Tantrum']);

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.behaviors.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJson([
            'data' => [
                ['family_member' => 'regina', 'name' => 'Shouting', 'points' => 1, 'image_url' => null],
                ['family_member' => 'regina', 'name' => 'Hitting', 'points' => 2],
            ],
        ])
        ->assertJsonCount(2, 'data');
});

it('does not list behaviors for someone who is not a kid', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.behaviors.index', ['member' => 'saida']))
        ->assertNotFound();
});

it('requires authentication to list behaviors', function () {
    $this->getJson(route('api.kids.behaviors.index', ['member' => 'regina']))
        ->assertUnauthorized();
});

it('creates a behavior for a kid', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behaviors.store'), [
            'family_member' => 'regina',
            'name' => 'Shouting',
            'points' => 1,
        ])
        ->assertCreated()
        ->assertJson(['data' => ['family_member' => 'regina', 'name' => 'Shouting', 'points' => 1]]);

    expect(Behavior::count())->toBe(1);
});

it('attaches a temp image when creating a behavior', function () {
    Storage::fake('public');
    Storage::fake('s3')->putFileAs('temp/uploads', UploadedFile::fake()->image('shout.png'), 'shout.png');

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.behaviors.store'), [
            'family_member' => 'regina',
            'name' => 'Shouting',
            'points' => 1,
            'image_path' => 'temp/uploads/shout.png',
        ])
        ->assertCreated();

    $behavior = Behavior::first();
    expect($behavior->getFirstMedia('illustration'))->not->toBeNull();
    expect($response->json('data.image_url'))->not->toBeNull();
});

it('rejects an image path outside temp storage', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behaviors.store'), [
            'family_member' => 'regina',
            'name' => 'Shouting',
            'points' => 1,
            'image_path' => 'articles/1/banner.png',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('image_path');
});

it('validates the behavior payload', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.behaviors.store'), [
            'family_member' => 'saida',
            'name' => '',
            'points' => 12,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['family_member', 'name', 'points']);
});

it('forbids a non family member from creating behaviors', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.behaviors.store'), [
            'family_member' => 'regina',
            'name' => 'Shouting',
            'points' => 1,
        ])
        ->assertForbidden();
});

it('updates a behavior', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $behavior = Behavior::factory()->create(['family_member' => 'regina', 'name' => 'Shouting', 'points' => 1]);

    $this->actingAs($alfonso)
        ->patchJson(route('api.behaviors.update', ['behavior' => $behavior]), [
            'name' => 'Yelling',
            'points' => 2,
        ])
        ->assertOk()
        ->assertJson(['data' => ['name' => 'Yelling', 'points' => 2]]);

    expect($behavior->fresh()->name)->toBe('Yelling');
});

it('replaces the illustration when updating with a new temp image', function () {
    Storage::fake('public');
    Storage::fake('s3')->putFileAs('temp/uploads', UploadedFile::fake()->image('new.png'), 'new.png');

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $behavior = Behavior::factory()->create(['family_member' => 'regina']);

    $this->actingAs($alfonso)
        ->patchJson(route('api.behaviors.update', ['behavior' => $behavior]), [
            'image_path' => 'temp/uploads/new.png',
        ])
        ->assertOk();

    expect($behavior->fresh()->getFirstMedia('illustration'))->not->toBeNull();
});

it('soft deletes a behavior so the feed keeps its history', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $behavior = Behavior::factory()->create(['family_member' => 'regina']);

    $this->actingAs($alfonso)
        ->deleteJson(route('api.behaviors.destroy', ['behavior' => $behavior]))
        ->assertOk();

    expect(Behavior::count())->toBe(0);
    expect(Behavior::withTrashed()->count())->toBe(1);
});
