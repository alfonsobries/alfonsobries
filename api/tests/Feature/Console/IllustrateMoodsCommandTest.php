<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

it('generates an anchored transparent emotion portrait', function () {
    fakeImageGeneration();
    $directory = sys_get_temp_dir().'/illustrate-moods-test-'.uniqid();

    $this->artisan('illustrate:moods', [
        'member' => 'regina',
        '--emotion' => ['happy'],
        '--attempts' => 1,
        '--dir' => $directory,
    ])->assertExitCode(0);

    $target = "{$directory}/regina/emotions/happy.png";

    expect($target)->toBeFile();

    Http::assertSent(function (Request $request): bool {
        if (! str_ends_with($request->url(), '/images/edits')) {
            return false;
        }

        $data = $request->data();
        $images = collect($data)->where('name', 'image[]');
        $prompt = sentImagePrompt($request);

        return $images->count() === 2
            && str_contains($prompt, 'SECOND attached image is the existing app avatar')
            && str_contains($prompt, 'Emotion: Feliz')
            && str_contains($prompt, 'solid, flat, uniform pure magenta #FF00FF');
    });
});

it('can generate one emotion for both children', function () {
    fakeImageGeneration();
    $directory = sys_get_temp_dir().'/illustrate-moods-test-'.uniqid();

    $this->artisan('illustrate:moods', [
        '--emotion' => ['calm'],
        '--attempts' => 1,
        '--dir' => $directory,
    ])->assertExitCode(0);

    expect("{$directory}/regina/emotions/calm.png")->toBeFile()
        ->and("{$directory}/andres/emotions/calm.png")->toBeFile();
});

it('rejects unknown members and emotions without generating', function (array $arguments) {
    fakeImageGeneration();

    $this->artisan('illustrate:moods', $arguments)->assertExitCode(1);

    Http::assertNothingSent();
})->with([
    'member' => [['member' => 'alfonso']],
    'emotion' => [['member' => 'regina', '--emotion' => ['sleepy']]],
]);
