<?php

use App\Models\Article;
use App\Models\User;
use App\Notifications\TypoNotification;
use Illuminate\Support\Facades\Notification;

it('sends a typo notification with the parameters', function () {
    $me = User::factory()->me()->create();

    $article = Article::factory()->create();

    Notification::fake();

    $response = $this->postJson(route('typo'), [
        'post_slug' => $article->slug,
        'message' => 'Hello there!',
        'typo_excerpt' => 'hello world',
    ]);

    $response->assertOk();

    Notification::assertSentTo(
        $me,
        TypoNotification::class,
        function ($notification) use ($article) {
            return $notification->article->is($article)
                && $notification->excerpt === 'hello world'
                && $notification->message === 'Hello there!';
        }
    );
});

it('validates the typo request', function () {
    Notification::fake();

    User::factory()->me()->create();

    $response = $this->postJson(route('typo'), [
        'post_slug' => 'does-not-exist',
        'message' => '',
        'typo_excerpt' => [],
    ]);

    $response->assertUnprocessable();

    $response->assertJsonValidationErrors([
        'post_slug',
        'message',
        'typo_excerpt',
    ]);

    Notification::assertNothingSent();
});
