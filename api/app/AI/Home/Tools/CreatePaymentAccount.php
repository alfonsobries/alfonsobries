<?php

namespace App\AI\Home\Tools;

use App\Events\ExpensesChanged;
use App\Models\PaymentAccount;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class CreatePaymentAccount implements Tool
{
    /**
     * @var array<string, string>
     */
    private const EMOJI_BY_KIND = [
        PaymentAccount::KIND_CREDIT_CARD => '💳',
        PaymentAccount::KIND_DEBIT_CARD => '💳',
        PaymentAccount::KIND_CASH => '💵',
        PaymentAccount::KIND_TRANSFER => '🏦',
        PaymentAccount::KIND_WALLET => '📱',
    ];

    public function name(): string
    {
        return 'create_payment_account';
    }

    public function description(): Stringable|string
    {
        return 'Add a payment method (card, account, wallet) the person mentions that is not in the account list yet, before recording an expense with it.';
    }

    public function handle(Request $request): Stringable|string
    {
        $kind = $request->string('kind')->toString();
        $kind = in_array($kind, PaymentAccount::KINDS, true) ? $kind : PaymentAccount::KIND_CREDIT_CARD;

        $owner = $request->string('owner')->toString();
        $owner = in_array($owner, User::MOOD_MEMBERS, true) ? $owner : null;

        $last4 = $request->string('last4')->toString();
        $last4 = preg_match('/^\d{4}$/', $last4) === 1 ? $last4 : null;

        $account = PaymentAccount::create([
            'name' => Str::limit($request->string('name')->trim()->toString(), 37),
            'emoji' => self::EMOJI_BY_KIND[$kind],
            'kind' => $kind,
            'last4' => $last4,
            'owner' => $owner,
            'sort_order' => (int) PaymentAccount::max('sort_order') + 1,
        ]);

        ExpensesChanged::dispatch();

        return "Created account id {$account->id}: {$account->name}";
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('Short name as people call it, e.g. "Amex", "BBVA débito".')->required(),
            'kind' => $schema->string()->enum(PaymentAccount::KINDS)->required(),
            'owner' => $schema->string()->enum(User::MOOD_MEMBERS)->description('Whose it is; omit when it is shared.'),
            'last4' => $schema->string()->description('Last four digits if mentioned.'),
        ];
    }
}
