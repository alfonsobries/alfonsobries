<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
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
     * @var array<int, string>
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
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
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
