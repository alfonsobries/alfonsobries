<?php

namespace App\Models\Traits;

use App\Models\SlugHistory;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasSlugHistory
{
    public static function bootHasSlugHistory(): void
    {
        static::saving(static function (self $article) {
            if ($article->shouldStoreTheSlug()) {
                $article->storeSlugInHistory();
            }
        });
    }

    /**
     * @return MorphMany<SlugHistory, $this>
     */
    public function slugHistory(): MorphMany
    {
        return $this->morphMany(SlugHistory::class, 'sluggable');
    }

    public function storeSlugInHistory(): void
    {
        $this->slugHistory()->create([
            'slug' => $this->slug,
        ]);
    }

    private function shouldStoreTheSlug(): bool
    {
        if (blank($this->slug)) {
            return false;
        }

        if (! $this->slugHistory()->where('slug', $this->slug)->doesntExist()) {
            return false;
        }

        if ($this->isClean('title')) {
            return false;
        }

        return $this->getOriginal('published_at') !== null;
    }
}
