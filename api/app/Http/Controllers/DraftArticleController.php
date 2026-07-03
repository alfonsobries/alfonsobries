<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Support\Collection;

class DraftArticleController extends Controller
{
    /**
     * @return Collection<int, array<array-key, mixed>>
     */
    public function slugs(): Collection
    {
        return Article::select('slug')->latest('created_at')->notPublished()->get()->map(fn (Article $article) => $article->getTranslations('slug'));
    }

    public function show(Article $article): Article
    {
        if ($article->isPublished()) {
            abort(404);
        }

        return $article;
    }
}
