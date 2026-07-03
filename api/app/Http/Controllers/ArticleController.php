<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * @return LengthAwarePaginator<int, Article>|Collection<int, Article>
     */
    public function index(Request $request): LengthAwarePaginator|Collection
    {
        $query = Article::published()->latest('published_at');

        if ($request->get('all', false)) {
            return $query->get();
        }

        return $query->paginate($request->get('limit', 10));
    }

    public function show(Article $article): Article
    {
        if (! $article->isPublished()) {
            abort(404);
        }

        return $article;
    }
}
