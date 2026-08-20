<?php

namespace App\Models;

use Database\Factories\LineContactFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A person (or service) the private line has exchanged messages or calls
 * with, keyed by their E.164 number. Autocreated the first time an unknown
 * number appears.
 */
class LineContact extends Model
{
    /** @use HasFactory<LineContactFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'e164',
        'name',
        'notes',
        'blocked',
        'favorite',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'blocked' => 'boolean',
        'favorite' => 'boolean',
    ];

    /**
     * @return HasMany<LineMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(LineMessage::class);
    }

    /**
     * @return HasMany<LineCall, $this>
     */
    public function calls(): HasMany
    {
        return $this->hasMany(LineCall::class);
    }

    /**
     * @return HasMany<LineVoicemail, $this>
     */
    public function voicemails(): HasMany
    {
        return $this->hasMany(LineVoicemail::class);
    }

    public function displayName(): string
    {
        return $this->name ?? $this->e164;
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
            'e164' => $this->e164,
            'name' => $this->name,
            'notes' => $this->notes,
            'blocked' => $this->blocked,
            'favorite' => $this->favorite,
        ];
    }
}
