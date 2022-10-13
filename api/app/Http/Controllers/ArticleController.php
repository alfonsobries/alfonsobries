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
        return $article;
    }

    // public static function handleMissing(Request $request): RedirectResponse
    // {
    //     /** @var Route $route */
    //     $route = $request->route();
    //     $slug  = $route->parameter('article');

    //     /** @var ?Article $article */
    //     $article = SlugHistory::where('slug', $slug)
    //         ->where('sluggable_type', (new Article())->getMorphClass())
    //         ->firstOrFail()
    //         ->sluggable;

    //     if ($article === null) {
    //         abort(404);
    //     }

    //     return Redirect::to($article->url(), 301);
    // }
}
