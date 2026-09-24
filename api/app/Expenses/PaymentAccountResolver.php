<?php

namespace App\Expenses;

use App\Events\ExpensesChanged;
use App\Models\PaymentAccount;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Turns a spoken account ("mi amex", "la de débito") into a payment account:
 * an existing one when the name matches, otherwise a new one, so a mention
 * never gets dropped just because the card wasn't set up beforehand.
 */
class PaymentAccountResolver
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

    public function resolve(string $name, ?string $kind = null, ?string $owner = null): PaymentAccount
    {
        $name = Str::limit(trim($name), 37, '');
        $owner = in_array($owner, User::MOOD_MEMBERS, true) ? $owner : null;
        $needle = Str::lower(Str::ascii($name));

        $existing = PaymentAccount::active()
            ->get()
            ->filter(fn (PaymentAccount $account): bool => str_contains(Str::lower(Str::ascii($account->name)), $needle)
                || str_contains($needle, Str::lower(Str::ascii($account->name))))
            ->sortByDesc(fn (PaymentAccount $account): int => $account->owner === $owner ? 1 : 0)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $kind = in_array($kind, PaymentAccount::KINDS, true) ? $kind : PaymentAccount::KIND_CREDIT_CARD;

        $account = PaymentAccount::create([
            'name' => $name,
            'emoji' => self::EMOJI_BY_KIND[$kind],
            'kind' => $kind,
            'owner' => $owner,
            'sort_order' => (int) PaymentAccount::max('sort_order') + 1,
        ]);

        ExpensesChanged::dispatch();

        return $account;
    }
}
