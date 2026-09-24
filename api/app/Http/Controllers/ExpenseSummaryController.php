<?php

namespace App\Http\Controllers;

use App\Expenses\SpendingReport;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExpenseSummaryController extends Controller
{
    /**
     * Totals for [from, to): the app sends the period's bounds in the
     * family's local time as ISO 8601.
     */
    public function __invoke(Request $request, SpendingReport $report): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after:from'],
            'paid_by' => ['nullable', Rule::in(User::MOOD_MEMBERS)],
            'category_id' => ['nullable', 'integer'],
            'payment_account_id' => ['nullable', 'integer'],
        ]);

        return response()->json([
            'data' => $report->summarize(
                CarbonImmutable::parse($validated['from']),
                CarbonImmutable::parse($validated['to']),
                [
                    'paid_by' => $validated['paid_by'] ?? null,
                    'category_id' => isset($validated['category_id']) ? (int) $validated['category_id'] : null,
                    'payment_account_id' => isset($validated['payment_account_id']) ? (int) $validated['payment_account_id'] : null,
                ],
            ),
        ]);
    }
}
