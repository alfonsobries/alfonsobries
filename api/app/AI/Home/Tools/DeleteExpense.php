<?php

namespace App\AI\Home\Tools;

use App\AI\Home\HomeTurn;
use App\Expenses\ExpenseRecorder;
use App\Models\Expense;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class DeleteExpense implements Tool
{
    public function __construct(
        private readonly HomeTurn $turn,
        private readonly ExpenseRecorder $recorder,
    ) {}

    public function name(): string
    {
        return 'delete_expense';
    }

    public function description(): Stringable|string
    {
        return 'Remove an expense the person asks to delete or that was recorded by mistake. It can be undone from the app.';
    }

    public function handle(Request $request): Stringable|string
    {
        $expense = Expense::find($request->integer('expense_id'));

        if ($expense === null) {
            return 'No expense with that id exists (it may already be deleted).';
        }

        $this->recorder->delete($expense, $this->turn->reply);

        return 'Deleted: '.ExpenseSummary::line($expense);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'expense_id' => $schema->integer()->required(),
        ];
    }
}
