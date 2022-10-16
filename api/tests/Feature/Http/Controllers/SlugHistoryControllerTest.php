<?php

use App\Models\Article;

it('returns all the elements in the slug history with his equivalente element', function () {
    $article = Article::factory()->published()->create([
        'title' => 'Title 1',
    ]);
    $article2 = Article::factory()->published()->create([
        'title' => 'Article 2 Title 1',
    ]);

    $article->update([
        'title' => 'Title 2',
    ]);

    $article->update([
        'title' => 'Title 3',
    ]);

    $article2->update([
        'title' => 'Article 2 Title 2',
    ]);

    $response = $this->getJson(route('slug-history.index'));

    $response->assertSuccessful();

    expect($response->json())->toEqual([
        [
            'slug' => 'title-1',
            'new_slug' => 'title-3',
        ],
        [
            'slug' => 'title-2',
            'new_slug' => 'title-3',
        ],
        [
            'slug' => 'article-2-title-1',
            'new_slug' => 'article-2-title-2',
        ],
    ]);
});
