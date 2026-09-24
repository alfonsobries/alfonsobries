<?php

namespace App\AI\Home\Tools;

use App\Expenses\SpendingReport;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class SummarizeSpending implements Tool
{
    public function __construct(
        private readonly SpendingReport $report,
    ) {}

    public function name(): string
    {
        return 'summarize_spending';
    }

    public function description(): Stringable|string
    {
        return 'Totals for a period (by category, person and account, compared with the previous period of the same length). Use it to answer questions about how much was spent.';
    }

    public function handle(Request $request): Stringable|string
    {
        $timezone = (string) config('family.timezone');

        try {
            $from = CarbonImmutable::parse($request->string('from')->toString(), $timezone)->startOfDay();
            $to = CarbonImmutable::parse($request->string('to')->toString(), $timezone)->addDay()->startOfDay();
        } catch (Throwable) {
            return 'Invalid dates; use YYYY-MM-DD.';
        }

        $paidBy = $request->string('paid_by')->toString();

        $summary = $this->report->summarize($from, $to, array_filter([
            'paid_by' => in_array($paidBy, User::MOOD_MEMBERS, true) ? $paidBy : null,
            'category_id' => $request->integer('category_id') ?: null,
            'payment_account_id' => $request->integer('payment_account_id') ?: null,
        ]));

        return json_encode([
            'currency' => $summary['currency'],
            'total' => $summary['total'],
            'count' => $summary['count'],
            'previous_period_total' => $summary['previous_total'],
            'by_category' => array_map(fn (array $row): array => [
                'category' => $row['category']['name'] ?? 'sin categoría',
                'total' => $row['total'],
                'count' => $row['count'],
            ], $summary['by_category']),
            'by_person' => array_map(fn (array $row): array => [
                'member' => $row['member'],
                'total' => $row['total'],
            ], $summary['by_person']),
            'by_account' => array_map(fn (array $row): array => [
                'account' => $row['account']['name'] ?? 'sin cuenta',
                'total' => $row['total'],
            ], $summary['by_account']),
            'other_currencies' => $summary['other_currencies'],
        ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('First local day, YYYY-MM-DD.')->required(),
            'to' => $schema->string()->description('Last local day (inclusive), YYYY-MM-DD.')->required(),
            'paid_by' => $schema->string()->enum(User::MOOD_MEMBERS),
            'category_id' => $schema->integer(),
            'payment_account_id' => $schema->integer(),
        ];
    }
}
