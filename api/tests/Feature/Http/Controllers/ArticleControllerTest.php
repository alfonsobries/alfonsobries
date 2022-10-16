<?php

use App\Models\Article;

it('lists all the latest published articles', function () {
    $third = Article::factory()->published()->create([
        'published_at' => now()->subDays(2),
    ]);

    $first = Article::factory()->published()->create([
        'published_at' => now(),
    ]);
    Article::factory()->count(2)->unpublished()->create();

    $second = Article::factory()->published()->create([
        'published_at' => now()->subDay(1),
    ]);

    $response = $this->getJson(route('articles.index'));

    $response->assertSuccessful();

    expect($response->json())->toHaveKeys(['data', 'links', 'current_page']);

    expect($response->json('data'))->toHaveCount(3);

    expect($response->json('data.0.id'))->toBe($first->id);
    expect($response->json('data.1.id'))->toBe($second->id);
    expect($response->json('data.2.id'))->toBe($third->id);
});

it('lists all the latest published articles without pagination if all param is passed', function () {
    $third = Article::factory()->published()->create([
        'published_at' => now()->subDays(2),
    ]);

    $first = Article::factory()->published()->create([
        'published_at' => now(),
    ]);
    Article::factory()->count(2)->unpublished()->create();

    $second = Article::factory()->published()->create([
        'published_at' => now()->subDay(1),
    ]);

    $response = $this->getJson(route('articles.index', ['all' => true]));

    $response->assertSuccessful();

    expect($response->json())->toHaveCount(3);

    expect($response->json('0.id'))->toBe($first->id);
    expect($response->json('1.id'))->toBe($second->id);
    expect($response->json('2.id'))->toBe($third->id);
});
