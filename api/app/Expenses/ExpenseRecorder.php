<?php

namespace App\Expenses;

use App\Events\ExpensesChanged;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\HomeMessage;
use App\Models\PaymentAccount;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Throwable;

/**
 * The one write path for expenses, the chat's tools, the Telegram bot and the
 * app's edit screens all land here, so the rules live in one place and every
 * change reaches the other partner's screen.
 */
class ExpenseRecorder
{
    public const ACTION_CREATED = 'created';

    public const ACTION_UPDATED = 'updated';

    public const ACTION_DELETED = 'deleted';

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $author, ?HomeMessage $reply = null, string $source = Expense::SOURCE_MANUAL): Expense
    {
        $attributes = $this->normalize($data, $author);

        foreach (['amount', 'description'] as $required) {
            if (! isset($attributes[$required])) {
                throw new InvalidArgumentException("An expense needs a {$required}.");
            }
        }

        $expense = Expense::create([
            'currency' => Expense::DEFAULT_CURRENCY,
            'paid_by' => $author->family_member,
            'spent_at' => now(),
            ...$attributes,
            'user_id' => $author->id,
            'source' => $source,
            'home_message_id' => $reply?->id,
        ]);

        $this->link($reply, $expense, self::ACTION_CREATED);
        $this->announce();

        return $expense->load(['category', 'account']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Expense $expense, array $data, User $author, ?HomeMessage $reply = null): Expense
    {
        $expense->update($this->normalize($data, $author));

        $this->link($reply, $expense, self::ACTION_UPDATED);
        $this->announce();

        return $expense->load(['category', 'account']);
    }

    public function delete(Expense $expense, ?HomeMessage $reply = null): Expense
    {
        $expense->delete();

        $this->link($reply, $expense, self::ACTION_DELETED);
        $this->announce();

        return $expense->load(['category', 'account']);
    }

    public function restore(Expense $expense): Expense
    {
        $expense->restore();

        $this->announce();

        return $expense->load(['category', 'account']);
    }

    /**
     * Turn loose input (from a form or a model's tool call) into columns,
     * dropping anything that doesn't resolve rather than guessing.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalize(array $data, User $author): array
    {
        $attributes = [];

        if (array_key_exists('amount', $data) && $data['amount'] !== null) {
            $amount = round((float) $data['amount'], 2);

            if ($amount <= 0 || $amount >= 10_000_000) {
                throw new InvalidArgumentException('The amount must be a positive number.');
            }

            $attributes['amount'] = $amount;
        }

        if (filled($data['currency'] ?? null)) {
            $currency = strtoupper(trim((string) $data['currency']));
            $attributes['currency'] = preg_match('/^[A-Z]{3}$/', $currency) === 1 ? $currency : Expense::DEFAULT_CURRENCY;
        }

        if (filled($data['description'] ?? null)) {
            $attributes['description'] = Str::limit(trim((string) $data['description']), 117);
        }

        if (array_key_exists('merchant', $data)) {
            $attributes['merchant'] = filled($data['merchant']) ? Str::limit(trim((string) $data['merchant']), 77) : null;
        }

        if (array_key_exists('note', $data)) {
            $attributes['note'] = filled($data['note']) ? trim((string) $data['note']) : null;
        }

        if (array_key_exists('emoji', $data)) {
            $attributes['emoji'] = $this->emoji($data['emoji']);
        }

        if (filled($data['paid_by'] ?? null) && in_array($data['paid_by'], User::MOOD_MEMBERS, true)) {
            $attributes['paid_by'] = $data['paid_by'];
        }

        if (array_key_exists('category_id', $data)) {
            $attributes['expense_category_id'] = $this->category($data['category_id']);
        }

        if (array_key_exists('payment_account_id', $data)) {
            $attributes['payment_account_id'] = $data['payment_account_id'] === null
                ? null
                : PaymentAccount::whereKey($data['payment_account_id'])->value('id');
        }

        if (filled($data['spent_at'] ?? null)) {
            $attributes['spent_at'] = $this->spentAt((string) $data['spent_at']);
        }

        return $attributes;
    }

    /**
     * Accepts a catalog name or an emoji typed by hand; anything longer than
     * one grapheme cluster isn't an emoji.
     */
    private function emoji(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        if (($named = ExpenseEmoji::fromName($value)) !== null) {
            return $named;
        }

        $value = trim($value);

        return grapheme_strlen($value) === 1 && preg_match('/^[\p{L}\p{N}\s]+$/u', $value) !== 1 ? $value : null;
    }

    /**
     * A category that no longer exists falls back to "Otros" rather than
     * leaving the expense uncategorized.
     */
    private function category(mixed $id): ?int
    {
        $found = $id === null ? null : ExpenseCategory::whereKey($id)->value('id');

        return $found ?? ExpenseCategory::active()->where('name', 'Otros')->value('id');
    }

    /**
     * A bare date means "that day", kept at the current time of day so a
     * day's expenses stay in the order they were told; future dates clamp to
     * now.
     */
    private function spentAt(string $value): CarbonImmutable
    {
        $timezone = (string) config('family.timezone');

        try {
            $parsed = preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1
                ? CarbonImmutable::parse($value.' '.now($timezone)->format('H:i:s'), $timezone)
                : CarbonImmutable::parse($value, $timezone);
        } catch (Throwable) {
            return CarbonImmutable::now();
        }

        return $parsed->isFuture() ? CarbonImmutable::now() : $parsed->utc();
    }

    private function link(?HomeMessage $reply, Expense $expense, string $action): void
    {
        if ($reply === null) {
            return;
        }

        $previous = $reply->expenses()->whereKey($expense->id)->first()?->pivot?->action;

        // Created then tweaked within the same answer is still news of a new expense.
        if ($previous === self::ACTION_CREATED && $action === self::ACTION_UPDATED) {
            return;
        }

        $reply->expenses()->syncWithoutDetaching([$expense->id => ['action' => $action]]);
    }

    private function announce(): void
    {
        try {
            ExpensesChanged::dispatch();
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function only(array $data): array
    {
        return Arr::only($data, [
            'amount', 'currency', 'description', 'merchant', 'note', 'emoji',
            'paid_by', 'category_id', 'payment_account_id', 'spent_at',
        ]);
    }
}
