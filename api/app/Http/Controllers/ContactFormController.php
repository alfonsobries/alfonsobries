<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\User;
use App\Notifications\ContactFormNotification;
use App\Notifications\TypoNotification;
use Illuminate\Http\Request;

class ContactFormController extends Controller
{
    public function __invoke(Request $request)
    {
        $this->validate($request, [
            'typo' => 'nullable|boolean',
            'name' => 'required_unless:typo,true|max:255',
            'post_slug' => 'required_if:typo,true|max:255',
            'email' => 'required_unless:typo,true|email|max:254',
            'message' => 'required|max:1000',
            'typo_excerpt' => 'nullable|string',
        ]);

        $notifable = User::whereEmail('alfonso@vexilo.com')->first();

        if ($request->boolean('typo')) {
            $notifable->notify(new TypoNotification(
                article: Article::whereSlug($request->get('post_slug'))->first(),
                message: $request->get('message'),
                excerpt: $request->get('typo_excerpt'),
            ));

            return;
        }

        $notifable->notify(new ContactFormNotification(
            name: $request->get('name'),
            email: $request->get('email'),
            message: $request->get('message'),
        ));
    }
}
