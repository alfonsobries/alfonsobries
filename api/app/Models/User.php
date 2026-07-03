<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'apple_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'apple_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'mood' => 'integer',
    ];

    /**
     * Bounds of the 1–9 mood scale, with 5 as the neutral centre.
     */
    public const MOOD_MIN = 1;

    public const MOOD_MAX = 9;

    public const MOOD_NEUTRAL = 5;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'family_member',
    ];

    public function getFamilyMemberAttribute(): ?string
    {
        return match (true) {
            $this->isAlfonso() => 'alfonso',
            $this->isSaida() => 'saida',
            default => null,
        };
    }

    /**
     * Limit the query to the people recognised as family members.
     *
     * @param  Builder<User>  $query
     */
    public function scopeFamily($query): void
    {
        $appleIds = array_filter([
            config('site.family.alfonso_apple_id'),
            config('site.family.saida_apple_id'),
        ]);

        $query->whereIn('apple_id', $appleIds);
    }

    public function isAlfonso(): bool
    {
        return $this->matchesFamilyAppleId(config('site.family.alfonso_apple_id'));
    }

    public function isSaida(): bool
    {
        return $this->matchesFamilyAppleId(config('site.family.saida_apple_id'));
    }

    public function isFamilyMember(): bool
    {
        return $this->isAlfonso() || $this->isSaida();
    }

    private function matchesFamilyAppleId(?string $appleId): bool
    {
        return $appleId !== null && $this->apple_id === $appleId;
    }
}
