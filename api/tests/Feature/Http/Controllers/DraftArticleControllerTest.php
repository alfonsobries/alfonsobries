<?php

use App\Models\Article;

it('lists all the latest unpublished articles slugs', function () {
    $third = Article::factory()->unpublished()->create([
        'created_at' => now()->subDays(2),
    ]);

    $first = Article::factory()->unpublished()->create([
        'created_at' => now(),
    ]);

    Article::factory()->count(2)->published()->create();

    $second = Article::factory()->unpublished()->create([
        'created_at' => now()->subDay(1),
    ]);

    $response = $this->getJson(route('draft_articles.slugs'));

    $response->assertSuccessful();

    expect($response->json())->toHaveCount(3);

    expect($response->json())->toEqual(
        [$first->slug, $second->slug, $third->slug]
    );
});

it('returns a non published article', function () {
    $article = Article::factory()->unpublished()->create();

    $response = $this->getJson(route('draft_articles.show', $article));

    $response->assertSuccessful();

    expect($response->json('id'))->toBe($article->id);
    expect($response->json('title'))->toBe($article->title);
});

it('returns 404 for an published article', function () {
    $article = Article::factory()->published()->create();

    $response = $this->getJson(route('draft_articles.show', $article));

    $response->assertNotFound();
});
