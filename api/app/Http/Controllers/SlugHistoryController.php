<?php

namespace App\Http\Controllers;

use App\Models\SlugHistory;
use Illuminate\Support\Collection;

class SlugHistoryController extends Controller
{
    /**
     * @return Collection<int, array{slug: string, new_slug: mixed}>
     */
    public function __invoke(): Collection
    {
        return SlugHistory::all()->map(function (SlugHistory $slugHistory) {
            return [
                'slug' => $slugHistory->slug,
                'new_slug' => $slugHistory->sluggable->getAttribute('slug'),
            ];
        });
    }
}
