<?php

namespace App\Http\Controllers;

use App\Events\ExpensesChanged;
use App\Models\ExpenseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExpenseCategoryController extends Controller
{
    /**
     * Every category in display order, archived ones last so history that
     * points at them still resolves.
     */
    public function index(): JsonResponse
    {
        $this->authorize('useHome');

        $categories = ExpenseCategory::query()
            ->orderByRaw('archived_at is not null')
            ->ordered()
            ->get()
            ->map(fn (ExpenseCategory $category): array => $category->toApiPayload())
            ->values();

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate($this->rules(), $this->messages());

        $category = ExpenseCategory::create([
            ...$validated,
            'sort_order' => (int) ExpenseCategory::max('sort_order') + 1,
        ]);

        ExpensesChanged::dispatch();

        return response()->json(['data' => $category->toApiPayload()], 201);
    }

    public function update(Request $request, ExpenseCategory $expenseCategory): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate([
            ...$this->rules($expenseCategory, sometimes: true),
            'archived' => ['sometimes', 'boolean'],
        ], $this->messages());

        if (array_key_exists('archived', $validated)) {
            $validated['archived_at'] = $validated['archived'] ? now() : null;
            unset($validated['archived']);
        }

        $expenseCategory->update($validated);

        ExpensesChanged::dispatch();

        return response()->json(['data' => $expenseCategory->toApiPayload()]);
    }

    /**
     * Save a new display order: the ids in the order they should appear.
     */
    public function reorder(Request $request): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        foreach (array_values($validated['ids']) as $position => $id) {
            ExpenseCategory::whereKey($id)->update(['sort_order' => $position]);
        }

        ExpensesChanged::dispatch();

        return $this->index();
    }

    /**
     * Unused categories go away; ones with history are archived instead so
     * past expenses keep their label.
     */
    public function destroy(ExpenseCategory $expenseCategory): JsonResponse
    {
        $this->authorize('useHome');

        if ($expenseCategory->expenses()->withTrashed()->exists()) {
            $expenseCategory->update(['archived_at' => now()]);
        } else {
            $expenseCategory->delete();
        }

        ExpensesChanged::dispatch();

        return response()->json(['data' => null]);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(?ExpenseCategory $ignore = null, bool $sometimes = false): array
    {
        $presence = $sometimes ? 'sometimes' : 'required';

        return [
            'name' => [$presence, 'string', 'max:40', Rule::unique('expense_categories', 'name')->ignore($ignore)],
            'emoji' => [$presence, 'string', 'max:16'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function messages(): array
    {
        return ['name.unique' => __('home.category_name_taken')];
    }
}
