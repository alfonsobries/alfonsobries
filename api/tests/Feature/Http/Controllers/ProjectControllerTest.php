<?php

use App\Models\Project;

it('lists all the published projects in order', function () {
    $first = Project::factory()->published()->create();

    $second = Project::factory()->published()->create();

    Project::factory()->count(2)->unpublished()->create();

    $third = Project::factory()->published()->create();

    $response = $this->getJson(route('projects.index'));

    $response->assertSuccessful();

    expect($response->json())->toHaveCount(3);

    expect($response->json('0.id'))->toBe($first->id);
    expect($response->json('1.id'))->toBe($second->id);
    expect($response->json('2.id'))->toBe($third->id);
});
