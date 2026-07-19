<?php

namespace App\Services;

use GdImage;

class IllustrationProcessor
{
    /**
     * Pad the image (never crop) with TRANSPARENCY until it matches the target
     * aspect ratio, preserving the alpha channel, so a keyed-out illustration
     * becomes an exact square without baking in a background.
     */
    public function padToAspect(string $bytes, int $wRatio, int $hRatio): string
    {
        $image = $this->decode($bytes);

        if ($image === null) {
            return $bytes;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $target = $wRatio / $hRatio;
        $current = $width / $height;

        if (abs($current - $target) < 0.001) {
            return $this->encode($image, $bytes);
        }

        if ($current > $target) {
            $canvasWidth = $width;
            $canvasHeight = (int) round($width / $target);
        } else {
            $canvasHeight = $height;
            $canvasWidth = (int) round($height * $target);
        }

        $canvas = imagecreatetruecolor($canvasWidth, $canvasHeight);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefilledrectangle($canvas, 0, 0, $canvasWidth, $canvasHeight, imagecolorallocatealpha($canvas, 0, 0, 0, 127));
        imagecopy(
            $canvas,
            $image,
            (int) (($canvasWidth - $width) / 2),
            (int) (($canvasHeight - $height) / 2),
            0,
            0,
            $width,
            $height,
        );

        return $this->encode($canvas, $bytes);
    }

    /**
     * Downsize an illustration to fit within a pixel box without enlarging or
     * changing its aspect ratio. The alpha channel stays intact.
     */
    public function resizeToFit(string $bytes, int $maxWidth, int $maxHeight): string
    {
        $image = $this->decode($bytes);

        if ($image === null || $maxWidth < 1 || $maxHeight < 1) {
            return $bytes;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1, $maxWidth / $width, $maxHeight / $height);

        if ($scale === 1) {
            return $bytes;
        }

        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));
        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, imagecolorallocatealpha($canvas, 0, 0, 0, 127));
        imagecopyresampled($canvas, $image, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        return $this->encode($canvas, $bytes);
    }

    /**
     * Flatten a (possibly transparent) image onto a solid background color and
     * return opaque PNG bytes, e.g. to bake a paper color into a print export.
     * A non-transparent input is unaffected.
     */
    public function flattenOnColor(string $bytes, string $hex): string
    {
        $image = $this->decode($bytes);

        if ($image === null) {
            return $bytes;
        }

        [$r, $g, $b] = $this->hexToRgb($hex);
        $width = imagesx($image);
        $height = imagesy($image);

        $canvas = imagecreatetruecolor($width, $height);
        imagefilledrectangle($canvas, 0, 0, $width, $height, imagecolorallocate($canvas, $r, $g, $b));
        imagealphablending($canvas, true);
        imagecopy($canvas, $image, 0, 0, 0, 0, $width, $height);

        return $this->encode($canvas, $bytes);
    }

    /**
     * Key out a flat magenta chroma background to transparency. Image models
     * have no reliable transparent mode, so the artwork is painted on solid
     * magenta #FF00FF; the model never reproduces it exactly, so this matches
     * by "magenta-ness" (how far R and B both exceed G) over a tolerance band
     * rather than an exact color, giving a soft alpha edge. Magenta never
     * appears inside the artwork (the style prompt forbids it), so only the
     * background is removed.
     *
     * Edge pixels that are a magenta↔art blend get de-spilled (their green is
     * lifted) so no pink halo remains against whatever sits behind the PNG.
     */
    public function chromaKeyToTransparent(string $bytes): string
    {
        $image = $this->decode($bytes);

        if ($image === null) {
            return $bytes;
        }

        if (! imageistruecolor($image)) {
            imagepalettetotruecolor($image);
        }

        imagealphablending($image, false);
        imagesavealpha($image, true);

        // Tolerance band for the magenta-ness metric m = min(R, B) - G:
        // m >= HIGH → fully transparent, m <= LOW → fully opaque, linear between.
        $low = 28;
        $high = 105;
        $width = imagesx($image);
        $height = imagesy($image);

        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $rgb = imagecolorat($image, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;

                $m = min($r, $b) - $g;

                if ($m <= $low) {
                    continue;
                }

                if ($m >= $high) {
                    $alpha = 127;
                } else {
                    $alpha = (int) round((127 * ($m - $low)) / ($high - $low));
                }

                $g = max($g, min($r, $b));

                imagesetpixel($image, $x, $y, ($alpha << 24) | ($r << 16) | ($g << 8) | $b);
            }
        }

        return $this->encode($image, $bytes);
    }

    /**
     * @return array{int, int, int}
     */
    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        if (! preg_match('/^[0-9a-fA-F]{6}$/', $hex)) {
            return [255, 255, 255];
        }

        return [(int) hexdec(substr($hex, 0, 2)), (int) hexdec(substr($hex, 2, 2)), (int) hexdec(substr($hex, 4, 2))];
    }

    private function decode(string $bytes): ?GdImage
    {
        if (! $this->looksLikeImage($bytes)) {
            return null;
        }

        $image = @imagecreatefromstring($bytes);

        return $image === false ? null : $image;
    }

    private function looksLikeImage(string $bytes): bool
    {
        return str_starts_with($bytes, "\x89PNG")
            || str_starts_with($bytes, "\xFF\xD8\xFF")
            || str_starts_with($bytes, 'GIF8')
            || str_starts_with($bytes, 'BM')
            || (str_starts_with($bytes, 'RIFF') && str_contains(substr($bytes, 0, 16), 'WEBP'));
    }

    private function encode(GdImage $image, string $original): string
    {
        imagesavealpha($image, true);

        ob_start();
        imagepng($image, null, 9);
        $clean = (string) ob_get_clean();

        return $clean !== '' ? $clean : $original;
    }
}
