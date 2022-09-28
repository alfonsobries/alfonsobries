<?php

namespace App\Observers;

use App\Models\Article;
use Illuminate\Support\Facades\Cache;

class ArticleObserver
{
    /**
     * Handle the Article "saved" event.
     *
     * @param  \App\Models\Article  $article
     * @return void
     */
    public function saved(Article $article)
    {
        Cache::set('fronted-expired', true);
    }
}
