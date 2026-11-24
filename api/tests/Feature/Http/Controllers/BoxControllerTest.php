<?php

use App\Models\Box;
use App\Models\BoxItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('lists every box with what is inside, for both parents', function (string $parent): void {
    $box = Box::factory()->create(['name' => 'Navidad', 'location' => 'Bodega']);
    BoxItem::factory()->for($box)->create(['name' => 'Esferas rojas', 'quantity' => 12]);
    BoxItem::factory()->for($box)->create(['name' => 'Luces']);

    $this->actingAs(User::factory()->create(['family_member' => $parent]))
        ->getJson(route('api.boxes.index'))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Navidad')
        ->assertJsonPath('data.0.location', 'Bodega')
        ->assertJsonPath('data.0.token', $box->token)
        ->assertJsonPath('data.0.public_url', 'https://api.alfonsobries.com/b/'.$box->token)
        ->assertJsonCount(2, 'data.0.items')
        // Newest first, so what was just stored shows on top.
        ->assertJsonPath('data.0.items.0.name', 'Luces')
        ->assertJsonPath('data.0.items.1.quantity', 12)
        ->assertJsonMissingPath('data.0.qr_svg');
})->with(['alfonso', 'saida']);

it('keeps the kids out of the boxes', function (): void {
    $this->actingAs(User::factory()->create(['family_member' => 'regina']))
        ->getJson(route('api.boxes.index'))
        ->assertForbidden();
});

it('creates a box with a permanent, unguessable token', function (): void {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.boxes.store'), ['name' => 'Herramientas', 'emoji' => '🧰', 'location' => null])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Herramientas')
        ->assertJsonPath('data.emoji', '🧰')
        ->assertJsonPath('data.items', []);

    $token = $response->json('data.token');
    expect($token)->toMatch('/^[a-z0-9]{12}$/');

    $this->actingAs($alfonso)
        ->patchJson(route('api.boxes.update', ['box' => $token]), ['name' => 'Herramientas del coche', 'emoji' => '🚗'])
        ->assertOk()
        ->assertJsonPath('data.token', $token);
});

it('requires a name and an emoji for a box', function (): void {
    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->postJson(route('api.boxes.store'), ['name' => '', 'emoji' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'emoji']);
});

it('shows a box with the QR that points at its public page', function (): void {
    $box = Box::factory()->create();

    $svg = $this->actingAs(User::factory()->create(['family_member' => 'saida']))
        ->getJson(route('api.boxes.show', ['box' => $box->token]))
        ->assertOk()
        ->json('data.qr_svg');

    expect($svg)->toStartWith('<svg')->toContain('</svg>');
});

it('deletes a box together with its items', function (): void {
    $box = Box::factory()->create();
    BoxItem::factory()->for($box)->count(2)->create();

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->deleteJson(route('api.boxes.destroy', ['box' => $box->token]))
        ->assertOk();

    expect(Box::count())->toBe(0)
        ->and(BoxItem::count())->toBe(0);
});

it('adds an item with its sticker', function (): void {
    Storage::fake('public');
    Storage::fake('s3')->putFileAs('temp/uploads', UploadedFile::fake()->image('drill.png'), 'drill.png');
    $box = Box::factory()->create();

    $response = $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->postJson(route('api.boxes.items.store', ['box' => $box->token]), [
            'name' => 'Taladro',
            'quantity' => 1,
            'notes' => 'Con brocas',
            'sticker_path' => 'temp/uploads/drill.png',
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Taladro')
        ->assertJsonPath('data.notes', 'Con brocas');

    expect($response->json('data.sticker_url'))->not->toBeNull()
        ->and($box->items()->first()->getFirstMedia('sticker'))->not->toBeNull();
});

it('rejects a sticker from outside temp storage', function (): void {
    $box = Box::factory()->create();

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->postJson(route('api.boxes.items.store', ['box' => $box->token]), [
            'name' => 'Taladro',
            'sticker_path' => 'media/1/other.png',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('sticker_path');
});

it('moves an item to another box', function (): void {
    $from = Box::factory()->create();
    $to = Box::factory()->create();
    $item = BoxItem::factory()->for($from)->create(['quantity' => 2]);

    $this->actingAs(User::factory()->create(['family_member' => 'saida']))
        ->patchJson(route('api.box-items.update', ['boxItem' => $item]), ['box' => $to->token, 'quantity' => 3])
        ->assertOk()
        ->assertJsonPath('data.quantity', 3);

    expect($item->fresh()->box_id)->toBe($to->id);
});

it('removes an item', function (): void {
    $item = BoxItem::factory()->create();

    $this->actingAs(User::factory()->create(['family_member' => 'alfonso']))
        ->deleteJson(route('api.box-items.destroy', ['boxItem' => $item]))
        ->assertOk();

    expect(BoxItem::count())->toBe(0);
});
