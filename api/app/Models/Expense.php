<?php

namespace App\Models;

use Database\Factories\ExpenseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property-read ExpenseCategory|null $category
 * @property-read PaymentAccount|null $account
 * @property-read ExpensePivot $pivot
 *
 * One thing the household paid for. Soft deletes keep a removed expense
 * readable on the chat card that removed it, and make the removal undoable.
 */
class Expense extends Model
{
    /** @use HasFactory<ExpenseFactory> */
    use HasFactory;

    use SoftDeletes;

    public const SOURCE_CHAT = 'chat';

    public const SOURCE_TELEGRAM = 'telegram';

    public const SOURCE_MANUAL = 'manual';

    public const DEFAULT_CURRENCY = 'MXN';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'paid_by',
        'expense_category_id',
        'payment_account_id',
        'amount',
        'currency',
        'description',
        'merchant',
        'emoji',
        'note',
        'spent_at',
        'source',
        'home_message_id',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'spent_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<ExpenseCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    /**
     * @return BelongsTo<PaymentAccount, $this>
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(PaymentAccount::class, 'payment_account_id');
    }

    /**
     * The shape the app receives. Expects `category` and `account` loaded.
     *
     * @return array<string, mixed>
     */
    public function toApiPayload(): array
    {
        return [
            'id' => $this->id,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'description' => $this->description,
            'merchant' => $this->merchant,
            'emoji' => $this->emoji ?? $this->category?->emoji,
            'note' => $this->note,
            'paid_by' => $this->paid_by,
            'spent_at' => $this->spent_at->toIso8601String(),
            'source' => $this->source,
            'category' => $this->category?->toApiPayload(),
            'account' => $this->account?->toApiPayload(),
            'deleted' => $this->trashed(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
