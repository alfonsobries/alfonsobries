<?php

use Laravel\Ai\Image;

it('generates an illustration for a member into the given path', function () {
    Image::fake();
    $target = sys_get_temp_dir().'/illustrate-test-'.uniqid().'.png';

    $this->artisan('illustrate', [
        'description' => 'gritando en la sala',
        '--member' => 'regina',
        '--out' => $target,
    ])->assertExitCode(0);

    expect(file_exists($target))->toBeTrue();
    unlink($target);

    Image::assertGenerated(
        fn ($generation): bool => str_contains($generation->prompt, 'Main character: Regina')
            && str_contains($generation->prompt, 'gritando en la sala'),
    );
});

it('generates object-only art when no member is given', function () {
    Image::fake();
    $target = sys_get_temp_dir().'/illustrate-test-'.uniqid().'.png';

    $this->artisan('illustrate', [
        'description' => 'un calendario con estrellas',
        '--out' => $target,
    ])->assertExitCode(0);

    expect(file_exists($target))->toBeTrue();
    unlink($target);

    Image::assertGenerated(
        fn ($generation): bool => str_contains($generation->prompt, 'NO people')
            && ! str_contains($generation->prompt, 'Main character:'),
    );
});

it('rejects an unknown member', function () {
    Image::fake();

    $this->artisan('illustrate', [
        'description' => 'algo',
        '--member' => 'nadie',
    ])->assertExitCode(1);

    Image::assertNothingGenerated();
});
