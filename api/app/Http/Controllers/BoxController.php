<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Box;
use App\Services\BoxLabel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoxController extends Controller
{
    public function __construct(
        private readonly BoxLabel $label,
    ) {}

    /**
     * Every box with everything in it: the whole catalog is small, and having
     * it all lets the app search across boxes and keep working offline.
     */
    public function index(): JsonResponse
    {
        $boxes = Box::query()
            ->with('items.media')
            ->latest('updated_at')
            ->get()
            ->map(fn (Box $box): array => $this->present($box))
            ->values();

        return response()->json(['data' => $boxes]);
    }

    public function store(Request $request): JsonResponse
    {
        $box = Box::create($this->validated($request));

        return response()->json(['data' => $this->present($box->load('items.media'))], 201);
    }

    public function show(Box $box): JsonResponse
    {
        return response()->json(['data' => $this->present($box->load('items.media'), withQr: true)]);
    }

    public function update(Request $request, Box $box): JsonResponse
    {
        $box->update($this->validated($request));

        return response()->json(['data' => $this->present($box->load('items.media'))]);
    }

    public function destroy(Box $box): JsonResponse
    {
        $box->items->each->delete();
        $box->delete();

        return response()->json(['data' => null]);
    }

    /**
     * @return array{name: string, location?: string|null}
     */
    private function validated(Request $request): array
    {
        /** @var array{name: string, location?: string|null} */
        return $request->validate([
            'name' => ['required', 'string', 'max:60'],
            'location' => ['nullable', 'string', 'max:60'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Box $box, bool $withQr = false): array
    {
        return [
            'token' => $box->token,
            'name' => $box->name,
            'location' => $box->location,
            'public_url' => $box->publicUrl(),
            'items' => $box->items->map(fn ($item): array => BoxItemController::present($item))->values(),
            'updated_at' => $box->updated_at?->toIso8601String(),
            ...($withQr ? ['qr_svg' => $this->label->qrSvg($box)] : []),
        ];
    }
}
