<?php

namespace App\Http\Controllers;

use App\Expenses\ExpenseRecorder;
use App\Expenses\SpendingReport;
use App\Models\Expense;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExpenseController extends Controller
{
    private const PAGE_SIZE = 50;

    public function __construct(
        private readonly ExpenseRecorder $recorder,
    ) {}

    /**
     * The household's expenses, newest first, filtered by period, person,
     * category, account or a search; paginated by `before` (the last
     * expense id on screen).
     */
    public function index(Request $request, SpendingReport $report): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'paid_by' => ['nullable', Rule::in(User::MOOD_MEMBERS)],
            'category_id' => ['nullable', 'integer'],
            'payment_account_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:80'],
            'before' => ['nullable', 'integer'],
        ]);

        $filters = [
            'paid_by' => $validated['paid_by'] ?? null,
            'category_id' => isset($validated['category_id']) ? (int) $validated['category_id'] : null,
            'payment_account_id' => isset($validated['payment_account_id']) ? (int) $validated['payment_account_id'] : null,
        ];

        $query = filled($validated['from'] ?? null) && filled($validated['to'] ?? null)
            ? $report->query(CarbonImmutable::parse($validated['from']), CarbonImmutable::parse($validated['to']), $filters)
            : $report->query(CarbonImmutable::createFromTimestamp(0), CarbonImmutable::now()->addYear(), $filters);

        $search = trim((string) ($validated['search'] ?? ''));

        if (($validated['before'] ?? null) !== null && ($cursor = Expense::withTrashed()->find($validated['before'])) !== null) {
            $query->where(fn (Builder $inner) => $inner
                ->where('spent_at', '<', $cursor->spent_at)
                ->orWhere(fn (Builder $same) => $same->where('spent_at', $cursor->spent_at)->where('id', '<', $cursor->id)));
        }

        $expenses = $query
            ->with(['category', 'account'])
            ->when($search !== '', fn (Builder $query) => $query->where(fn (Builder $inner) => $inner
                ->where('description', 'like', "%{$search}%")
                ->orWhere('merchant', 'like', "%{$search}%")
                ->orWhere('note', 'like', "%{$search}%")))
            ->orderByDesc('spent_at')
            ->orderByDesc('id')
            ->limit(self::PAGE_SIZE + 1)
            ->get();

        return response()->json([
            'data' => $expenses->take(self::PAGE_SIZE)->map(fn (Expense $expense): array => $expense->toApiPayload())->values(),
            'has_more' => $expenses->count() > self::PAGE_SIZE,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('useHome');

        $expense = $this->recorder->create($this->validated($request, creating: true), $request->user());

        return response()->json(['data' => $expense->toApiPayload()], 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        $this->authorize('useHome');

        return response()->json(['data' => $expense->load(['category', 'account'])->toApiPayload()]);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $this->authorize('useHome');

        $expense = $this->recorder->update($expense, $this->validated($request, creating: false), $request->user());

        return response()->json(['data' => $expense->toApiPayload()]);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $this->authorize('useHome');

        return response()->json(['data' => $this->recorder->delete($expense)->toApiPayload()]);
    }

    /**
     * Undo a removal, from the chat card or the toast after deleting.
     */
    public function restore(int $expense): JsonResponse
    {
        $this->authorize('useHome');

        $model = Expense::onlyTrashed()->findOrFail($expense);

        return response()->json(['data' => $this->recorder->restore($model)->toApiPayload()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $creating): array
    {
        $required = $creating ? 'required' : 'sometimes';

        $validated = $request->validate([
            'amount' => [$required, 'numeric', 'gt:0', 'lt:10000000'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'description' => [$required, 'string', 'max:117'],
            'merchant' => ['sometimes', 'nullable', 'string', 'max:77'],
            'note' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'emoji' => ['sometimes', 'nullable', 'string', 'max:16'],
            'paid_by' => ['sometimes', Rule::in(User::MOOD_MEMBERS)],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:expense_categories,id'],
            'payment_account_id' => ['sometimes', 'nullable', 'integer', 'exists:payment_accounts,id'],
            'spent_at' => ['sometimes', 'date'],
        ]);

        return ExpenseRecorder::only($validated);
    }
}
