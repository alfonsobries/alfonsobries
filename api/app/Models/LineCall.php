<?php

namespace App\Models;

use Database\Factories\LineCallFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LineCall extends Model
{
    /** @use HasFactory<LineCallFactory> */
    use HasFactory;

    public const DIRECTION_IN = 'in';

    public const DIRECTION_OUT = 'out';

    public const STATUS_RINGING = 'ringing';

    public const STATUS_ANSWERED = 'answered';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_MISSED = 'missed';

    public const STATUS_FAILED = 'failed';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'provider_id',
        'line_contact_id',
        'direction',
        'status',
        'answered_by',
        'started_at',
        'answered_at',
        'ended_at',
        'duration_sec',
        'recording_path',
        'cost_usd',
        'seen_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'started_at' => 'datetime',
        'answered_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_sec' => 'integer',
        'cost_usd' => 'float',
        'seen_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<LineContact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(LineContact::class, 'line_contact_id');
    }

    /**
     * @return HasOne<LineVoicemail, $this>
     */
    public function voicemail(): HasOne
    {
        return $this->hasOne(LineVoicemail::class);
    }

    public function isMissed(): bool
    {
        return $this->status === self::STATUS_MISSED;
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
            'contact' => $this->relationLoaded('contact') ? $this->contact->toApiPayload() : null,
            'direction' => $this->direction,
            'status' => $this->status,
            'answered_by' => $this->answered_by,
            'started_at' => $this->started_at->toIso8601String(),
            'answered_at' => $this->answered_at?->toIso8601String(),
            'ended_at' => $this->ended_at?->toIso8601String(),
            'duration_sec' => $this->duration_sec,
            'has_recording' => $this->recording_path !== null,
            'cost_usd' => $this->cost_usd,
            'seen_at' => $this->seen_at?->toIso8601String(),
            'voicemail' => $this->relationLoaded('voicemail')
                ? $this->voicemail?->toApiPayload()
                : null,
        ];
    }
}
