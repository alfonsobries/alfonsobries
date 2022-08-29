<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactFormController extends Controller
{
    public function __invoke(Request $request)
    {
        $values = $this->validate($request, [
            'name' => 'required|max:255',
            'email' => 'required|email|max:254',
            'message' => 'required|max:1000',
        ]);

        Mail::to('alfonso@vexilo.com')
            ->send(new ContactFormEmail(name: $values['name'], email: $values['email'], message: $values['message']));
    }
}
