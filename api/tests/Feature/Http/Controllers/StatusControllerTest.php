<?php

it('returns the api status payload', function () {
    $response = $this->getJson(route('api.status'));

    $response->assertOk()
        ->assertJsonStructure([
            'message',
            'status',
            'environment',
            'version',
            'server_time',
        ])
        ->assertJson([
            'status' => 'online',
        ]);
});
