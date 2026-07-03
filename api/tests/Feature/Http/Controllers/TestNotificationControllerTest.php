<?php

use App\Models\DeviceToken;
use App\Models\User;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Notification;

it('sends a test notification to the user devices', function () {
    Notification::fake();

    $user = User::factory()->create();
    DeviceToken::create([
        'user_id' => $user->id,
        'expo_token' => 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
    ]);

    $this->actingAs($user)
        ->postJson(route('api.notifications.test'))
        ->assertOk();

    Notification::assertSentTo($user, TestNotification::class);
});

it('returns 422 when the user has no registered device', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('api.notifications.test'))
        ->assertUnprocessable();

    Notification::assertNothingSent();
});

it('requires authentication to send a test notification', function () {
    $this->postJson(route('api.notifications.test'))->assertUnauthorized();
});
