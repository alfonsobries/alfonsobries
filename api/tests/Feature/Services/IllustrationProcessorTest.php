<?php

use App\Services\IllustrationProcessor;

function pngFromPixels(array $rows): string
{
    $height = count($rows);
    $width = count($rows[0]);
    $image = imagecreatetruecolor($width, $height);

    foreach ($rows as $y => $row) {
        foreach ($row as $x => [$r, $g, $b]) {
            imagesetpixel($image, $x, $y, imagecolorallocate($image, $r, $g, $b));
        }
    }

    ob_start();
    imagepng($image);

    return (string) ob_get_clean();
}

function alphaAt(string $bytes, int $x, int $y): int
{
    $image = imagecreatefromstring($bytes);

    return (imagecolorat($image, $x, $y) >> 24) & 0x7F;
}

it('keys the magenta background out to transparency and keeps the artwork', function () {
    $magenta = [255, 0, 255];
    $black = [17, 17, 17];
    $white = [255, 255, 255];

    $bytes = (new IllustrationProcessor)->chromaKeyToTransparent(pngFromPixels([
        [$magenta, $magenta, $magenta],
        [$magenta, $black, $white],
        [$magenta, $magenta, $magenta],
    ]));

    expect(alphaAt($bytes, 0, 0))->toBe(127)   // background gone
        ->and(alphaAt($bytes, 1, 1))->toBe(0)  // black line art stays
        ->and(alphaAt($bytes, 2, 1))->toBe(0); // white fills stay opaque
});

it('pads to a square with transparency instead of cropping', function () {
    $black = [17, 17, 17];

    $bytes = (new IllustrationProcessor)->padToAspect(pngFromPixels([
        [$black, $black, $black, $black],
        [$black, $black, $black, $black],
    ]), 1, 1);

    $image = imagecreatefromstring($bytes);

    expect(imagesx($image))->toBe(4)
        ->and(imagesy($image))->toBe(4)
        ->and(alphaAt($bytes, 0, 0))->toBe(127)  // new padding is transparent
        ->and(alphaAt($bytes, 0, 1))->toBe(0);   // original artwork intact
});

it('downsizes an illustration while preserving its alpha channel', function () {
    $processor = new IllustrationProcessor;
    $transparent = $processor->chromaKeyToTransparent(pngFromPixels(array_fill(0, 8, array_fill(0, 12, [255, 0, 255]))));
    $bytes = $processor->resizeToFit($transparent, 6, 6);
    $image = imagecreatefromstring($bytes);

    expect(imagesx($image))->toBe(6)
        ->and(imagesy($image))->toBe(4)
        ->and(alphaAt($bytes, 0, 0))->toBe(127);
});

it('flattens a transparent image onto a solid color for printing', function () {
    $magenta = [255, 0, 255];
    $black = [17, 17, 17];

    $processor = new IllustrationProcessor;
    $transparent = $processor->chromaKeyToTransparent(pngFromPixels([
        [$magenta, $black],
        [$magenta, $magenta],
    ]));

    $flat = $processor->flattenOnColor($transparent, '#FFFFFF');
    $image = imagecreatefromstring($flat);

    $corner = imagecolorat($image, 0, 1);

    expect(alphaAt($flat, 0, 1))->toBe(0)
        ->and(($corner >> 16) & 0xFF)->toBe(255)
        ->and($corner & 0xFF)->toBe(255);
});
