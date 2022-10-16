<?php

use App\Models\User;
use App\Notifications\ContactFormNotification;
use Illuminate\Support\Facades\Notification;

it('sends a contact form notification with the parameters', function () {
    $me = User::factory()->me()->create();

    Notification::fake();

    $response = $this->postJson(route('contact'), [
        'name' => 'Alfonso',
        'email' => 'alfonso@gmail.com',
        'message' => 'Hello there!',
    ]);

    $response->assertOk();

    Notification::assertSentTo(
        User::whereEmail($me->email)->first(),
        ContactFormNotification::class,
        function ($notification, $channels) {
            return $notification->name === 'Alfonso'
                && $notification->email === 'alfonso@gmail.com'
                && $notification->message === 'Hello there!';
        }
    );
});

it('validates the form request', function () {
    User::factory()->me()->create();

    Notification::fake();

    $response = $this->postJson(route('contact'), [
        'name' => '',
        'email' => '123456',
        'message' => null,
    ]);

    $response->assertUnprocessable();

    $response->assertJsonValidationErrors([
        'name',
        'email',
        'message',
    ]);

    Notification::assertNothingSent();
});
