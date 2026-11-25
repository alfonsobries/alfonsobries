<?php

use App\AI\BoxItemDescriber;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('s3')->putFileAs('temp/uploads', UploadedFile::fake()->image('cable.png'), 'cable.png');
});

it('suggests a short name from the photo with the fast vision model', function (): void {
    BoxItemDescriber::fake(['Cable USB-C a HDMI']);

    $this->actingAs(User::factory()->create(['family_member' => 'saida']))
        ->postJson(route('api.box-items.describe'), ['image_path' => 'temp/uploads/cable.png'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Cable USB-C a HDMI');

    BoxItemDescriber::assertPrompted(fn ($prompt): bool => $prompt->model === 'claude-haiku-5-5'
        && count($prompt->attachments) === 1);
});

it('keeps only a clean label when the model adds quotes or a period', function (): void {
    BoxItemDescriber::fake(["\"esferas navideñas rojas.\"\nSon adornos."]);

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->postJson(route('api.box-items.describe'), ['image_path' => 'temp/uploads/cable.png'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Esferas navideñas rojas');
});

it('suggests nothing when the photo shows nothing recognizable', function (): void {
    BoxItemDescriber::fake(["\n"]);

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->postJson(route('api.box-items.describe'), ['image_path' => 'temp/uploads/cable.png'])
        ->assertOk()
        ->assertJsonPath('data.name', null);
});

it('only describes images from temp storage', function (): void {
    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->postJson(route('api.box-items.describe'), ['image_path' => 'media/1/photo.png'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('image_path');
});

it('keeps the kids out', function (): void {
    $this->actingAs(User::factory()->create(['family_member' => 'regina']))
        ->postJson(route('api.box-items.describe'), ['image_path' => 'temp/uploads/cable.png'])
        ->assertForbidden();
});

it('reports a failing provider and answers with a gateway error', function (): void {
    Exceptions::fake();
    BoxItemDescriber::fake(fn () => throw new RuntimeException('Provider down'));

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->postJson(route('api.box-items.describe'), ['image_path' => 'temp/uploads/cable.png'])
        ->assertStatus(502);

    Exceptions::assertReported(RuntimeException::class);
});
