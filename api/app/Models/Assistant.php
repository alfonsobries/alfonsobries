<?php

namespace App\Models;

use Database\Factories\AssistantFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A chat "mini app": a system prompt plus presentation hints, assignable to
 * specific family members so each one sees their own set of assistants.
 */
class Assistant extends Model
{
    /** @use HasFactory<AssistantFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'slug',
        'name',
        'emoji',
        'description',
        'instructions',
        'provider',
        'model',
        'members',
        'copyable_output',
        'sort_order',
        'is_active',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'members' => 'array',
        'copyable_output' => 'boolean',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * @return HasMany<Conversation, $this>
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function isVisibleTo(?string $member): bool
    {
        return $member !== null
            && $this->is_active
            && in_array($member, $this->members ?? [], true);
    }

    /**
     * @return array{id: int, slug: string, name: string, emoji: string|null, description: string|null, copyable_output: bool}
     */
    public function toApiPayload(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'emoji' => $this->emoji,
            'description' => $this->description,
            'copyable_output' => $this->copyable_output,
        ];
    }
}
