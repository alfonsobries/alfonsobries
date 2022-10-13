<?php

namespace App\Http\Controllers;

use App\Models\SlugHistory;

class SlugHistoryController extends Controller
{
    public function __invoke()
    {
        return SlugHistory::all()->map(function (SlugHistory $slugHistory) {
            return [
                'slug' => $slugHistory->slug,
                'new_slug' => $slugHistory->sluggable->slug,
            ];
        });
    }
}
