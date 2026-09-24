<?php

namespace App\Models;

use Database\Factories\ExpenseCategoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A bucket the household's spending is grouped by. Archiving hides it from new
 * expenses without rewriting the history that already points at it.
 */
class ExpenseCategory extends Model
{
    /** @use HasFactory<ExpenseCategoryFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'emoji',
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
     * @param  Builder<ExpenseCategory>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('archived_at');
    }

    /**
     * @param  Builder<ExpenseCategory>  $query
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
     * @return array{id: int, name: string, emoji: string, archived: bool}
     */
    public function toApiPayload(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'emoji' => $this->emoji,
            'archived' => $this->archived_at !== null,
        ];
    }
}
