<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\User;
use App\Notifications\TypoNotification;
use Illuminate\Http\Request;

class TypoFormController extends Controller
{
    public function __invoke(Request $request)
    {
        $this->validate($request, [
            'post_slug' => 'required|max:255|exists:articles,slug',
            'message' => 'required|string',
            'typo_excerpt' => 'nullable|string',
        ]);

        $notifable = User::whereEmail(config('site.admin.email'))->first();

        $notifable->notify(new TypoNotification(
            article: Article::whereSlug($request->get('post_slug'))->first(),
            message: $request->get('message'),
            excerpt: $request->get('typo_excerpt'),
        ));
    }
}
