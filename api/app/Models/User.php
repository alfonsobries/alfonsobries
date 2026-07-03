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
        'family_member',
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
     * The family members who have a mood — only the parents.
     *
     * @var list<string>
     */
    public const MOOD_MEMBERS = ['alfonso', 'saida'];

    /**
     * Which family member an Apple sign-in identity maps to, so a login can be
     * tied to the right seeded person. Null for anyone who isn't family.
     */
    public static function familyMemberForAppleId(?string $appleId): ?string
    {
        if ($appleId === null) {
            return null;
        }

        return match ($appleId) {
            config('site.family.alfonso_apple_id') => 'alfonso',
            config('site.family.saida_apple_id') => 'saida',
            default => null,
        };
    }

    /**
     * Limit the query to the people who represent a family member.
     *
     * @param  Builder<User>  $query
     */
    public function scopeFamily($query): void
    {
        $query->whereNotNull('family_member');
    }

    public function isAlfonso(): bool
    {
        return $this->family_member === 'alfonso';
    }

    public function isSaida(): bool
    {
        return $this->family_member === 'saida';
    }

    public function isRegina(): bool
    {
        return $this->family_member === 'regina';
    }

    public function isAndres(): bool
    {
        return $this->family_member === 'andres';
    }

    public function isFamilyMember(): bool
    {
        return $this->family_member !== null;
    }

    public function hasMood(): bool
    {
        return in_array($this->family_member, self::MOOD_MEMBERS, true);
    }
}
