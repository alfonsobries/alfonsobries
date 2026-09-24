<?php

namespace App\Expenses;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\PaymentAccount;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Where the money went over a period: totals by category, person and account,
 * a time series, and the same-length period before for comparison. Totals are
 * in the household currency; other currencies are reported apart instead of
 * converted with a rate nobody agreed on.
 */
class SpendingReport
{
    /**
     * Longest span still charted day by day; beyond it the series goes monthly.
     */
    private const DAILY_SERIES_MAX_DAYS = 62;

    /**
     * @param  array{paid_by?: string|null, category_id?: int|null, payment_account_id?: int|null}  $filters
     * @return array<string, mixed>
     */
    public function summarize(CarbonImmutable $from, CarbonImmutable $to, array $filters = []): array
    {
        $expenses = $this->query($from, $to, $filters)->with(['category', 'account'])->get();
        $local = $expenses->where('currency', Expense::DEFAULT_CURRENCY);
        $total = $this->sum($local);

        $length = $from->diffInSeconds($to);
        $previousTotal = $this->sum(
            $this->query($from->subSeconds((int) $length), $from, $filters)
                ->where('currency', Expense::DEFAULT_CURRENCY)
                ->get(['amount']),
        );

        return [
            'from' => $from->toIso8601String(),
            'to' => $to->toIso8601String(),
            'currency' => Expense::DEFAULT_CURRENCY,
            'total' => $total,
            'count' => $local->count(),
            'previous_total' => $previousTotal,
            'by_category' => $this->byCategory($local, $total),
            'by_person' => $this->byPerson($local, $total),
            'by_account' => $this->byAccount($local, $total),
            'series' => $this->series($local, $from, $to),
            'largest' => $local->sortByDesc(fn (Expense $expense): float => (float) $expense->amount)
                ->take(5)
                ->map(fn (Expense $expense): array => $expense->toApiPayload())
                ->values()
                ->all(),
            'other_currencies' => $expenses->where('currency', '!=', Expense::DEFAULT_CURRENCY)
                ->groupBy('currency')
                ->map(fn (Collection $group, string $currency): array => [
                    'currency' => $currency,
                    'total' => $this->sum($group),
                    'count' => $group->count(),
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  array{paid_by?: string|null, category_id?: int|null, payment_account_id?: int|null}  $filters
     * @return Builder<Expense>
     */
    public function query(CarbonImmutable $from, CarbonImmutable $to, array $filters = []): Builder
    {
        return Expense::query()
            ->where('spent_at', '>=', $from->utc())
            ->where('spent_at', '<', $to->utc())
            ->when($filters['paid_by'] ?? null, fn (Builder $query, string $member) => $query->where('paid_by', $member))
            ->when($filters['category_id'] ?? null, fn (Builder $query, int $id) => $query->where('expense_category_id', $id))
            ->when($filters['payment_account_id'] ?? null, fn (Builder $query, int $id) => $query->where('payment_account_id', $id));
    }

    /**
     * @param  Collection<int, Expense>  $expenses
     */
    private function sum(Collection $expenses): float
    {
        return round($expenses->sum(fn (Expense $expense): float => (float) $expense->amount), 2);
    }

    /**
     * @param  Collection<int, Expense>  $expenses
     * @return list<array<string, mixed>>
     */
    private function byCategory(Collection $expenses, float $total): array
    {
        return $expenses
            ->groupBy(fn (Expense $expense): int => $expense->expense_category_id ?? 0)
            ->map(function (Collection $group) use ($total): array {
                /** @var ExpenseCategory|null $category */
                $category = $group->first()->category;
                $sum = $this->sum($group);

                return [
                    'category' => $category?->toApiPayload(),
                    'total' => $sum,
                    'count' => $group->count(),
                    'share' => $total > 0 ? round($sum / $total, 4) : 0,
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Expense>  $expenses
     * @return list<array<string, mixed>>
     */
    private function byPerson(Collection $expenses, float $total): array
    {
        return collect(['alfonso', 'saida'])
            ->map(function (string $member) use ($expenses, $total): array {
                $group = $expenses->where('paid_by', $member);
                $sum = $this->sum($group);

                return [
                    'member' => $member,
                    'total' => $sum,
                    'count' => $group->count(),
                    'share' => $total > 0 ? round($sum / $total, 4) : 0,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Expense>  $expenses
     * @return list<array<string, mixed>>
     */
    private function byAccount(Collection $expenses, float $total): array
    {
        return $expenses
            ->groupBy(fn (Expense $expense): int => $expense->payment_account_id ?? 0)
            ->map(function (Collection $group) use ($total): array {
                /** @var PaymentAccount|null $account */
                $account = $group->first()->account;
                $sum = $this->sum($group);

                return [
                    'account' => $account?->toApiPayload(),
                    'total' => $sum,
                    'count' => $group->count(),
                    'share' => $total > 0 ? round($sum / $total, 4) : 0,
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->all();
    }

    /**
     * One point per day (or per month on long spans), zero-filled so the
     * chart shows the quiet days too.
     *
     * @param  Collection<int, Expense>  $expenses
     * @return array{unit: string, points: list<array{date: string, total: float}>}
     */
    private function series(Collection $expenses, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $timezone = (string) config('family.timezone');
        $monthly = $from->diffInDays($to) > self::DAILY_SERIES_MAX_DAYS;
        $format = $monthly ? 'Y-m' : 'Y-m-d';

        $totals = $expenses
            ->groupBy(fn (Expense $expense): string => $expense->spent_at->timezone($timezone)->format($format))
            ->map(fn (Collection $group): float => $this->sum($group));

        $points = [];
        $cursor = $from->timezone($timezone)->startOfDay();

        if ($monthly) {
            $cursor = $cursor->startOfMonth();
        }

        while ($cursor < $to) {
            $key = $cursor->format($format);
            $points[] = ['date' => $cursor->toDateString(), 'total' => (float) ($totals[$key] ?? 0)];
            $cursor = $monthly ? $cursor->addMonth() : $cursor->addDay();
        }

        return ['unit' => $monthly ? 'month' : 'day', 'points' => $points];
    }
}
