<?php

namespace App\AI\Home\Tools;

use App\Models\Expense;

/**
 * How an expense reads back to the model: compact, with every id it might
 * need for a follow-up correction.
 */
class ExpenseSummary
{
    public static function line(Expense $expense): string
    {
        $expense->loadMissing(['category', 'account']);

        return sprintf(
            '#%d %s %s %s | %s | %s | paid by %s | %s%s',
            $expense->id,
            $expense->emoji ?? $expense->category->emoji ?? '',
            number_format((float) $expense->amount, 2),
            $expense->currency,
            $expense->description,
            $expense->category->name ?? 'sin categoría',
            $expense->paid_by,
            $expense->spent_at->timezone((string) config('family.timezone'))->format('Y-m-d H:i'),
            $expense->account ? ' | '.$expense->account->name : '',
        );
    }
}
