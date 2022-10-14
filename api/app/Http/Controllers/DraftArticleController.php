<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class DraftArticleController extends Controller
{
    public function index(Request $request)
    {
        return Article::notPublished()->get();
    }

    public function show(Article $article)
    {
        return $article;
    }
}
