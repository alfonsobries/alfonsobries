<?php

namespace App\Http\Controllers;

use App\Models\Article;

class DraftArticleController extends Controller
{
    public function slugs()
    {
        return Article::select('slug')->latest('created_at')->notPublished()->get()->map(fn ($article) => $article->getTranslations('slug'));
    }

    public function show(Article $article)
    {
        if ($article->isPublished()) {
            abort(404);
        }

        return $article;
    }
}
