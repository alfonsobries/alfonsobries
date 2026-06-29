<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\User;
use App\Notifications\TypoNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TypoFormController extends Controller
{
    public function __invoke(Request $request)
    {
        $locale = app()->getLocale();

        $this->validate($request, [
            'post_slug' => ['required', 'max:255', Rule::exists('articles', "slug->{$locale}")],
            'message' => 'required|string',
            'typo_excerpt' => 'nullable|string',
        ]);

        $notifable = User::whereEmail(config('site.admin.email'))->first();

        // Send synchronously: this site has no queue worker, so a queued
        // notification would never be delivered.
        $notifable->notifyNow(new TypoNotification(
            article: Article::where("slug->{$locale}", $request->get('post_slug'))->first(),
            message: $request->get('message'),
            excerpt: $request->get('typo_excerpt'),
        ));
    }
}
