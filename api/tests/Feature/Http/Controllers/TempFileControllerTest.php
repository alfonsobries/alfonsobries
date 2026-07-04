<?php

use App\Models\User;

it('returns a presigned url and a temp key', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.temp-files.presign'), [
            'content_type' => 'image/png',
            'extension' => 'png',
        ])
        ->assertOk();

    expect($response->json('key'))->toStartWith('temp/uploads/');
    expect($response->json('key'))->toEndWith('.png');
    expect($response->json('url'))->toContain('X-Amz-Signature');
});

it('only accepts images', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.temp-files.presign'), [
            'content_type' => 'application/pdf',
            'extension' => 'pdf',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['content_type', 'extension']);
});

it('forbids a non family member from presigning uploads', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.temp-files.presign'), [
            'content_type' => 'image/png',
            'extension' => 'png',
        ])
        ->assertForbidden();
});

it('requires authentication to presign uploads', function () {
    $this->postJson(route('api.temp-files.presign'), [
        'content_type' => 'image/png',
        'extension' => 'png',
    ])->assertUnauthorized();
});
