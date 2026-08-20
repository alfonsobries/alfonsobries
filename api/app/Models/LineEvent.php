<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Raw webhook event from the provider. The unique provider_event_id is what
 * makes the provider's delivery retries harmless.
 */
class LineEvent extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'provider_event_id',
        'type',
        'payload',
        'processed_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'payload' => 'array',
        'processed_at' => 'datetime',
    ];

    /**
     * The resource the event describes, whatever envelope nesting the
     * provider uses.
     *
     * @return array<string, mixed>
     */
    public function objectPayload(): array
    {
        $payload = $this->payload ?? [];

        return $payload['data']['object'] ?? $payload['data'] ?? $payload['object'] ?? $payload;
    }
}
