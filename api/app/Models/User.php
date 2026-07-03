<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
     * Identify which known family member this user is by matching their Apple
     * sub against the `site.family` map. Returns the member key or null.
     */
    protected function familyKey(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (! $this->apple_id) {
                return null;
            }

            foreach (config('site.family') as $member) {
                if (($member['apple_id'] ?? null) === $this->apple_id) {
                    return $member['key'] ?? null;
                }
            }

            return null;
        });
    }

    public function isFamilyMember(): bool
    {
        return $this->family_key !== null;
    }
}
