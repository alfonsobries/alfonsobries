<?php

namespace App\Http\Controllers;

use App\Models\Article;

class ArticleController extends Controller
{
    public function __invoke()
    {
        return Article::published()->latest('published_at')->simplePaginate(10);
    }
}
