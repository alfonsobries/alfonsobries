<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

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
}
