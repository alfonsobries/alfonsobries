<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ContactFormNotification;
use Illuminate\Http\Request;

class ContactFormController extends Controller
{
    public function __invoke(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|max:255',
            'email' => 'required|email|max:254',
            'message' => 'required|max:1000',
        ]);

        $notifable = User::whereEmail(config('site.admin.email'))->first();

        // Send synchronously: this site has no queue worker, so a queued
        // notification would never be delivered.
        $notifable->notifyNow(new ContactFormNotification(
            name: $request->get('name'),
            email: $request->get('email'),
            message: $request->get('message'),
        ));
    }
}
