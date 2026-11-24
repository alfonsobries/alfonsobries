<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\BehaviorIllustration;
use App\Models\Box;
use App\Models\BoxItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoxItemController extends Controller
{
    public function store(Request $request, Box $box): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'quantity' => ['sometimes', 'integer', 'between:1,'.BoxItem::MAX_QUANTITY],
            'notes' => ['nullable', 'string', 'max:500'],
            'sticker_path' => ['nullable', 'string', 'starts_with:temp/'],
        ]);

        $item = $box->items()->create($validated);

        $this->attachSticker($item, $validated['sticker_path'] ?? null);
        $box->touch();

        return response()->json(['data' => self::present($item->load('media'))], 201);
    }

    /**
     * Edits an item, or moves it to another box when `box` names one.
     */
    public function update(Request $request, BoxItem $boxItem): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:80'],
            'quantity' => ['sometimes', 'integer', 'between:1,'.BoxItem::MAX_QUANTITY],
            'notes' => ['sometimes', 'nullable', 'string', 'max:500'],
            'sticker_path' => ['nullable', 'string', 'starts_with:temp/'],
            'box' => ['sometimes', 'string', 'exists:boxes,token'],
        ]);

        $previousBox = $boxItem->box;

        if (isset($validated['box'])) {
            $validated['box_id'] = Box::where('token', $validated['box'])->value('id');
        }

        $boxItem->update($validated);

        $this->attachSticker($boxItem, $validated['sticker_path'] ?? null);
        $previousBox->touch();
        $boxItem->box()->first()?->touch();

        return response()->json(['data' => self::present($boxItem->load('media'))]);
    }

    public function destroy(BoxItem $boxItem): JsonResponse
    {
        $boxItem->box->touch();
        $boxItem->delete();

        return response()->json(['data' => null]);
    }

    /**
     * @return array{id: int, name: string, quantity: int, notes: string|null, sticker_url: string|null}
     */
    public static function present(BoxItem $item): array
    {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'quantity' => $item->quantity,
            'notes' => $item->notes,
            'sticker_url' => $item->stickerUrl(),
        ];
    }

    private function attachSticker(BoxItem $item, ?string $path): void
    {
        if ($path === null) {
            return;
        }

        $item
            ->addMediaFromDisk($path, BehaviorIllustration::DISK)
            ->toMediaCollection('sticker');
    }
}
