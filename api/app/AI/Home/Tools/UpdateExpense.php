<?php

namespace App\AI\Home\Tools;

use App\AI\Home\HomeTurn;
use App\Expenses\ExpenseRecorder;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use InvalidArgumentException;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class UpdateExpense implements Tool
{
    public function __construct(
        private readonly HomeTurn $turn,
        private readonly ExpenseRecorder $recorder,
    ) {}

    public function name(): string
    {
        return 'update_expense';
    }

    public function description(): Stringable|string
    {
        return 'Correct an existing expense (amount, category, account, date, who paid…). Only pass the fields that change.';
    }

    public function handle(Request $request): Stringable|string
    {
        $expense = Expense::find($request->integer('expense_id'));

        if ($expense === null) {
            return 'No expense with that id exists (it may have been deleted).';
        }

        try {
            $expense = $this->recorder->update(
                $expense,
                ExpenseRecorder::only($request->except('expense_id')),
                $this->turn->user,
                $this->turn->reply,
            );
        } catch (InvalidArgumentException $exception) {
            return 'Not updated: '.$exception->getMessage();
        }

        return 'Updated: '.ExpenseSummary::line($expense);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'expense_id' => $schema->integer()->required(),
            'amount' => $schema->number(),
            'currency' => $schema->string(),
            'description' => $schema->string(),
            'merchant' => $schema->string(),
            'category_id' => $schema->integer(),
            'payment_account_id' => $schema->integer(),
            'emoji' => $schema->string()->description('Name from the emoji catalog.'),
            'paid_by' => $schema->string()->enum(User::MOOD_MEMBERS),
            'spent_at' => $schema->string()->description('Local date (YYYY-MM-DD) or datetime.'),
            'note' => $schema->string(),
        ];
    }
}
