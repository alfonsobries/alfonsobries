<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Box;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

/**
 * The QR printed on a box: its public URL as a crisp vector code, with
 * medium error correction so a scuffed or wrinkled label still scans.
 */
class BoxLabel
{
    private const SIZE = 512;

    public function qrSvg(Box $box): string
    {
        $writer = new Writer(new ImageRenderer(new RendererStyle(self::SIZE, 0), new SvgImageBackEnd));

        $svg = $writer->writeString($box->publicUrl(), ecLevel: ErrorCorrectionLevel::M());

        return trim((string) preg_replace('/^<\?xml[^>]*\?>/', '', $svg));
    }
}
