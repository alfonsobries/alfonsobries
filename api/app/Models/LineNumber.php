<?php

namespace App\Models;

use Database\Factories\LineNumberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Local mirror of the provisioned number at the provider (there is a single
 * line today, but the mirror keeps its lifecycle — renewal, status, AI
 * config — queryable without hitting the provider).
 */
class LineNumber extends Model
{
    /** @use HasFactory<LineNumberFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'provider_id',
        'e164',
        'display',
        'status',
        'billing_period',
        'renews_at',
        'auto_renew',
        'ai_enabled',
        'ai_config',
        'on_off',
        'usage',
        'balance_usd',
        'synced_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'renews_at' => 'datetime',
        'auto_renew' => 'boolean',
        'ai_enabled' => 'boolean',
        'ai_config' => 'array',
        'on_off' => 'array',
        'usage' => 'array',
        'balance_usd' => 'float',
        'synced_at' => 'datetime',
    ];

    /**
     * The shape the app receives.
     *
     * @return array<string, mixed>
     */
    public function toApiPayload(): array
    {
        return [
            'id' => $this->id,
            'e164' => $this->e164,
            'display' => $this->display,
            'status' => $this->status,
            'billing_period' => $this->billing_period,
            'renews_at' => $this->renews_at?->toIso8601String(),
            'auto_renew' => $this->auto_renew,
            'ai_enabled' => $this->ai_enabled,
            'ai_config' => $this->ai_config,
            'on_off' => $this->on_off,
            'usage' => $this->usage,
            'balance_usd' => $this->balance_usd,
            'panel_url' => (string) config('services.privacynumber.panel_url'),
            'synced_at' => $this->synced_at?->toIso8601String(),
        ];
    }
}
