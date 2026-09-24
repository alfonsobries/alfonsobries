<?php

namespace App\Models;

use Database\Factories\PaymentAccountFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A way the household pays: a card, cash, a transfer account. `owner` is the
 * family member it belongs to, or null when both use it.
 */
class PaymentAccount extends Model
{
    /** @use HasFactory<PaymentAccountFactory> */
    use HasFactory;

    public const KIND_CREDIT_CARD = 'credit_card';

    public const KIND_DEBIT_CARD = 'debit_card';

    public const KIND_CASH = 'cash';

    public const KIND_TRANSFER = 'transfer';

    public const KIND_WALLET = 'wallet';

    /**
     * @var list<string>
     */
    public const KINDS = [
        self::KIND_CREDIT_CARD,
        self::KIND_DEBIT_CARD,
        self::KIND_CASH,
        self::KIND_TRANSFER,
        self::KIND_WALLET,
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'emoji',
        'kind',
        'last4',
        'owner',
        'sort_order',
        'archived_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'sort_order' => 'integer',
        'archived_at' => 'datetime',
    ];

    /**
     * @param  Builder<PaymentAccount>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('archived_at');
    }

    /**
     * @param  Builder<PaymentAccount>  $query
     */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * @return HasMany<Expense, $this>
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * @return array{id: int, name: string, emoji: string, kind: string, last4: string|null, owner: string|null, archived: bool}
     */
    public function toApiPayload(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'emoji' => $this->emoji,
            'kind' => $this->kind,
            'last4' => $this->last4,
            'owner' => $this->owner,
            'archived' => $this->archived_at !== null,
        ];
    }
}
