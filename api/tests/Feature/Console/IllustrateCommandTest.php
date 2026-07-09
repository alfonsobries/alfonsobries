<?php

use Illuminate\Support\Facades\Http;

it('generates an illustration for a member into the given path', function () {
    fakeImageGeneration();
    $target = sys_get_temp_dir().'/illustrate-test-'.uniqid().'.png';

    $this->artisan('illustrate', [
        'description' => 'gritando en la sala',
        '--member' => 'regina',
        '--out' => $target,
    ])->assertExitCode(0);

    expect(file_exists($target))->toBeTrue();
    unlink($target);

    Http::assertSent(
        fn ($request): bool => str_contains(sentImagePrompt($request), 'Main character: Regina')
            && str_contains(sentImagePrompt($request), 'gritando en la sala'),
    );
});

it('generates object-only art when no member is given', function () {
    fakeImageGeneration();
    $target = sys_get_temp_dir().'/illustrate-test-'.uniqid().'.png';

    $this->artisan('illustrate', [
        'description' => 'un calendario con estrellas',
        '--out' => $target,
    ])->assertExitCode(0);

    expect(file_exists($target))->toBeTrue();
    unlink($target);

    Http::assertSent(
        fn ($request): bool => str_contains(sentImagePrompt($request), 'NO people')
            && ! str_contains(sentImagePrompt($request), 'Main character:'),
    );
});

it('rejects an unknown member', function () {
    fakeImageGeneration();

    $this->artisan('illustrate', [
        'description' => 'algo',
        '--member' => 'nadie',
    ])->assertExitCode(1);

    Http::assertNothingSent();
});
