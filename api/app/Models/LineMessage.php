<?php

namespace App\Models;

use App\Services\Line\OtpExtractor;
use Database\Factories\LineMessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class LineMessage extends Model
{
    /** @use HasFactory<LineMessageFactory> */
    use HasFactory;

    public const DIRECTION_IN = 'in';

    public const DIRECTION_OUT = 'out';

    public const STATUS_QUEUED = 'queued';

    public const STATUS_SENT = 'sent';

    public const STATUS_DELIVERED = 'delivered';

    public const STATUS_FAILED = 'failed';

    public const STATUS_RECEIVED = 'received';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'provider_id',
        'client_key',
        'line_contact_id',
        'direction',
        'body',
        'media_urls',
        'media_paths',
        'segments',
        'status',
        'failure_code',
        'cost_usd',
        'scheduled_at',
        'provider_created_at',
        'delivered_at',
        'read_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'media_urls' => 'array',
        'media_paths' => 'array',
        'segments' => 'integer',
        'cost_usd' => 'float',
        'scheduled_at' => 'datetime',
        'provider_created_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<LineContact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(LineContact::class, 'line_contact_id');
    }

    public function isInbound(): bool
    {
        return $this->direction === self::DIRECTION_IN;
    }

    /**
     * The shape the app receives, both over HTTP and on the broadcast channel.
     *
     * @return array<string, mixed>
     */
    public function toApiPayload(): array
    {
        return [
            'id' => $this->id,
            'contact_id' => $this->line_contact_id,
            'contact' => $this->relationLoaded('contact') ? $this->contact?->toApiPayload() : null,
            'client_key' => $this->client_key,
            'direction' => $this->direction,
            'body' => $this->body,
            'media_urls' => $this->publicMediaUrls(),
            'segments' => $this->segments,
            'status' => $this->status,
            'failure_code' => $this->failure_code,
            'cost_usd' => $this->cost_usd,
            'otp_code' => $this->isInbound() ? OtpExtractor::extract($this->body) : null,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'sent_at' => $this->provider_created_at->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'read_at' => $this->read_at?->toIso8601String(),
        ];
    }

    /**
     * Prefer our archived copies (signed) over the provider's short-lived URLs.
     *
     * @return list<string>
     */
    public function publicMediaUrls(): array
    {
        $paths = $this->media_paths ?? [];

        if ($paths !== []) {
            return array_values(array_map(
                fn (string $path): string => Storage::disk('s3')->temporaryUrl($path, now()->addHour()),
                $paths,
            ));
        }

        return array_values(array_filter(
            $this->media_urls ?? [],
            fn (mixed $url): bool => is_string($url) && $url !== '',
        ));
    }
}
