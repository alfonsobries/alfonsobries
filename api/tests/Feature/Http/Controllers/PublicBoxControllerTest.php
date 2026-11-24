<?php

use App\Models\Box;
use App\Models\BoxItem;

it('shows what is inside a box to anyone with its label', function (): void {
    $box = Box::factory()->create(['name' => 'Navidad', 'location' => 'Bodega']);
    BoxItem::factory()->for($box)->create(['name' => 'Esferas rojas', 'quantity' => 12, 'notes' => 'Las de vidrio']);

    $this->withHeader('Accept-Language', 'es-MX,es;q=0.9')
        ->get('/b/'.$box->token)
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
        ->assertSee('Navidad')
        ->assertSee('Bodega')
        ->assertSee('Esferas rojas')
        ->assertSee('×12')
        ->assertSee('Las de vidrio')
        ->assertSee('1 cosa')
        ->assertSee('alfonsobries://b/'.$box->token, escape: false);
});

it('speaks English to an English browser', function (): void {
    $box = Box::factory()->create();

    $this->withHeader('Accept-Language', 'en-US')
        ->get('/b/'.$box->token)
        ->assertOk()
        ->assertSee('This box is empty.');
});

it('answers an unknown label with not found', function (): void {
    $this->get('/b/abcdefghijkl')->assertNotFound();
    $this->get('/b/short')->assertNotFound();
});

it('tells iOS that box labels open in the app', function (): void {
    $this->getJson('/.well-known/apple-app-site-association')
        ->assertOk()
        ->assertJsonPath('applinks.details.0.appIDs.0', 'TY2LB9Y7DK.com.alfonsobries.app')
        ->assertJsonPath('applinks.details.0.components.0./', '/b/*');
});
