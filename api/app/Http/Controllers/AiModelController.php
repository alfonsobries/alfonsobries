<?php

namespace App\Http\Controllers;

use App\AI\ModelCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The runtime AI model switch: which chat model and which image model the
 * whole app runs on. Only Alfonso can see or change it.
 */
class AiModelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        return response()->json(['data' => $this->present()]);
    }

    public function update(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'kind' => ['required', Rule::in(ModelCatalog::kinds())],
            'id' => ['required', 'string'],
        ]);

        if (ModelCatalog::find($validated['kind'], $validated['id']) === null) {
            return response()->json(['message' => 'Unknown model.'], 422);
        }

        ModelCatalog::activate($validated['kind'], $validated['id']);

        return response()->json(['data' => $this->present()]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isAlfonso()) {
            return response()->json(['message' => 'Only Alfonso can manage the AI models.'], 403);
        }

        return null;
    }

    /**
     * @return array<string, array{models: list<array<string, mixed>>, active: string}>
     */
    private function present(): array
    {
        return collect(ModelCatalog::kinds())
            ->mapWithKeys(fn (string $kind): array => [$kind => [
                'models' => collect(ModelCatalog::all($kind))
                    ->map(fn (array $entry): array => collect($entry)->only([
                        'id', 'label', 'provider', 'cost', 'blurb', 'recommended',
                    ])->all())
                    ->all(),
                'active' => ModelCatalog::active($kind)['id'],
            ]])
            ->all();
    }
}
