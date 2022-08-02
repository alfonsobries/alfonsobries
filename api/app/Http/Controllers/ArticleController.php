<?php

namespace App\Http\Controllers;

use App\Models\Article;

class ArticleController extends Controller
{
    public function index()
    {
        return Article::published()->latest('published_at')->get();
    }

    public function show(Article $article)
    {
        return $article;
    }
}
