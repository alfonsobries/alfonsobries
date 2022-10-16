<?php

namespace App\Http\Controllers;

use App\Models\Article;
// use App\Models\SlugHistory;
// use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

// use Illuminate\Support\Facades\Redirect;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::published()->latest('published_at');

        if ($request->get('all', false)) {
            return $query->get();
        }

        return $query->paginate($request->get('limit', 10));
    }

    public function show(Article $article)
    {
        if (! $article->isPublished()) {
            abort(404);
        }

        return $article;
    }
}
