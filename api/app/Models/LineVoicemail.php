<?php

namespace App\Models;

use Database\Factories\LineVoicemailFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A voicemail left on the line. The provider's audio URLs expire after an
 * hour, so the audio is archived to our own S3 bucket as soon as the
 * voicemail arrives (see ArchiveLineAudio).
 */
class LineVoicemail extends Model
{
    /** @use HasFactory<LineVoicemailFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'provider_id',
        'line_call_id',
        'line_contact_id',
        'audio_path',
        'transcript',
        'translation',
        'summary',
        'sentiment',
        'duration_sec',
        'received_at',
        'heard_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'duration_sec' => 'integer',
        'received_at' => 'datetime',
        'heard_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<LineContact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(LineContact::class, 'line_contact_id');
    }

    /**
     * @return BelongsTo<LineCall, $this>
     */
    public function call(): BelongsTo
    {
        return $this->belongsTo(LineCall::class, 'line_call_id');
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
            'call_id' => $this->line_call_id,
            'has_audio' => $this->audio_path !== null,
            'transcript' => $this->transcript,
            'translation' => $this->translation,
            'summary' => $this->summary,
            'sentiment' => $this->sentiment,
            'duration_sec' => $this->duration_sec,
            'received_at' => $this->received_at->toIso8601String(),
            'heard_at' => $this->heard_at?->toIso8601String(),
        ];
    }
}
