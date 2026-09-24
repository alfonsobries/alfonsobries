<?php

namespace App\AI\Home\Tools;

use App\Models\Expense;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class FindExpenses implements Tool
{
    private const MAX_RESULTS = 40;

    public function name(): string
    {
        return 'find_expenses';
    }

    public function description(): Stringable|string
    {
        return 'List individual expenses matching a search, newest first, with their ids. Use it to find an older expense to fix or delete, or to answer "what did we buy at X".';
    }

    public function handle(Request $request): Stringable|string
    {
        $timezone = (string) config('family.timezone');

        try {
            $from = $request->filled('from') ? CarbonImmutable::parse($request->string('from')->toString(), $timezone)->startOfDay() : null;
            $to = $request->filled('to') ? CarbonImmutable::parse($request->string('to')->toString(), $timezone)->addDay()->startOfDay() : null;
        } catch (Throwable) {
            return 'Invalid dates; use YYYY-MM-DD.';
        }

        $search = $request->string('search')->trim()->toString();
        $paidBy = $request->string('paid_by')->toString();

        $expenses = Expense::query()
            ->with(['category', 'account'])
            ->when($from, fn (Builder $query) => $query->where('spent_at', '>=', $from->utc()))
            ->when($to, fn (Builder $query) => $query->where('spent_at', '<', $to->utc()))
            ->when($search !== '', fn (Builder $query) => $query->where(fn (Builder $inner) => $inner
                ->where('description', 'like', "%{$search}%")
                ->orWhere('merchant', 'like', "%{$search}%")
                ->orWhere('note', 'like', "%{$search}%")))
            ->when(in_array($paidBy, User::MOOD_MEMBERS, true), fn (Builder $query) => $query->where('paid_by', $paidBy))
            ->when($request->integer('category_id'), fn (Builder $query, int $id) => $query->where('expense_category_id', $id))
            ->when($request->integer('payment_account_id'), fn (Builder $query, int $id) => $query->where('payment_account_id', $id))
            ->latest('spent_at')
            ->limit(min($request->integer('limit') ?: 15, self::MAX_RESULTS))
            ->get();

        if ($expenses->isEmpty()) {
            return 'No matching expenses.';
        }

        return $expenses->map(fn (Expense $expense): string => ExpenseSummary::line($expense))->implode("\n");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('Words in the description, merchant or note.'),
            'from' => $schema->string()->description('First local day, YYYY-MM-DD.'),
            'to' => $schema->string()->description('Last local day (inclusive), YYYY-MM-DD.'),
            'paid_by' => $schema->string()->enum(User::MOOD_MEMBERS),
            'category_id' => $schema->integer(),
            'payment_account_id' => $schema->integer(),
            'limit' => $schema->integer()->description('Up to 40; defaults to 15.'),
        ];
    }
}
