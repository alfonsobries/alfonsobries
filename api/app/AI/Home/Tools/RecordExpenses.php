<?php

namespace App\AI\Home\Tools;

use App\AI\Home\HomeTurn;
use App\Expenses\ExpenseRecorder;
use App\Expenses\PaymentAccountResolver;
use App\Models\PaymentAccount;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use InvalidArgumentException;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RecordExpenses implements Tool
{
    public function __construct(
        private readonly HomeTurn $turn,
        private readonly ExpenseRecorder $recorder,
        private readonly PaymentAccountResolver $accounts,
    ) {}

    public function name(): string
    {
        return 'record_expenses';
    }

    public function description(): Stringable|string
    {
        return 'Save one or more expenses the person reports (typed, dictated, or read from a receipt photo). One item per distinct purchase.';
    }

    public function handle(Request $request): Stringable|string
    {
        $saved = [];
        $errors = [];

        foreach ((array) $request->array('items') as $index => $item) {
            try {
                $item = (array) $item;

                if (empty($item['payment_account_id']) && filled($item['payment_account_name'] ?? null)) {
                    $item['payment_account_id'] = $this->accounts->resolve(
                        (string) $item['payment_account_name'],
                        $item['payment_account_kind'] ?? null,
                        $item['payment_account_owner'] ?? null,
                    )->id;
                }

                $expense = $this->recorder->create(
                    ExpenseRecorder::only($item),
                    $this->turn->user,
                    $this->turn->reply,
                    $this->turn->source(),
                );

                $saved[] = ExpenseSummary::line($expense);
            } catch (InvalidArgumentException $exception) {
                $errors[] = "item {$index}: {$exception->getMessage()}";
            }
        }

        return json_encode(['saved' => $saved, 'errors' => $errors], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'items' => $schema->array()->items($schema->object([
                'amount' => $schema->number()->description('Positive amount paid.')->required(),
                'currency' => $schema->string()->description('ISO 4217 code. MXN unless another currency is clear.'),
                'description' => $schema->string()->description('Short, natural label in the person\'s language, e.g. "Café en Starbucks". Max 60 chars.')->required(),
                'merchant' => $schema->string()->description('Store or business name when known.'),
                'category_id' => $schema->integer()->description('Id from the category list.')->required(),
                'payment_account_id' => $schema->integer()->description('Id from the account list, when the payment method was mentioned or is on the receipt and it is in the list.'),
                'payment_account_name' => $schema->string()->description('When they mention a card or account that is NOT in the list (e.g. "Amex", "BBVA débito"): its short name. It gets created.'),
                'payment_account_kind' => $schema->string()->enum(PaymentAccount::KINDS)->description('Kind of that new account.'),
                'payment_account_owner' => $schema->string()->enum(User::MOOD_MEMBERS)->description('Whose that new account is ("mi amex" = the speaker). Omit when shared.'),
                'emoji' => $schema->string()->description('Name from the emoji catalog that best depicts the item.'),
                'paid_by' => $schema->string()->enum(User::MOOD_MEMBERS)->description('Who paid. Defaults to the speaker.'),
                'spent_at' => $schema->string()->description('Local date (YYYY-MM-DD) or datetime when it was not today/now.'),
                'note' => $schema->string()->description('Extra detail worth keeping, if any.'),
            ]))->min(1)->required(),
        ];
    }
}
