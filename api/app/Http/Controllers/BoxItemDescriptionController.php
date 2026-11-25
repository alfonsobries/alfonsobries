<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\AI\BoxItemDescriber;
use App\Models\BehaviorIllustration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Image;
use Throwable;

class BoxItemDescriptionController extends Controller
{
    /**
     * A vision call should answer in about a second; past this the person has
     * already typed the name themselves.
     */
    private const TIMEOUT = 15;

    private const MAX_LENGTH = 80;

    /**
     * Suggests a short name for a freshly photographed item, from the image
     * already uploaded to temp storage for the item itself.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image_path' => ['required', 'string', 'starts_with:temp/'],
        ]);

        try {
            $response = (new BoxItemDescriber)->prompt(
                'Name this object.',
                [Image::fromStorage($validated['image_path'], BehaviorIllustration::DISK)],
                Lab::from((string) config('site.box_item_describer.provider')),
                (string) config('site.box_item_describer.model'),
                self::TIMEOUT,
            );
        } catch (Throwable $exception) {
            report($exception);

            return response()->json(['message' => __('boxes.describe_failed')], 502);
        }

        return response()->json(['data' => ['name' => $this->clean($response->text)]]);
    }

    private function clean(string $text): ?string
    {
        $name = Str::of($text)
            ->explode("\n")
            ->map(fn (string $line): string => trim($line, " \t\"'“”«».:"))
            ->first(fn (string $line): bool => $line !== '');

        return $name === null ? null : Str::ucfirst(Str::limit($name, self::MAX_LENGTH, ''));
    }
}
