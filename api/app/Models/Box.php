<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\BoxFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * A storage box the parents keep things in. Its QR label points at a public
 * page listing what is inside, so the box never has to be opened to know.
 */
class Box extends Model
{
    /** @use HasFactory<BoxFactory> */
    use HasFactory;

    private const TOKEN_LENGTH = 12;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'location',
    ];

    protected static function booted(): void
    {
        static::creating(function (Box $box): void {
            $box->token ??= self::newToken();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'token';
    }

    /**
     * @return HasMany<BoxItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(BoxItem::class)->latest('id');
    }

    /**
     * The address printed in the QR label: a browser shows the public page and
     * a phone with the app installed opens the box in the app instead.
     */
    public function publicUrl(): string
    {
        return route('boxes.public', ['token' => $this->token]);
    }

    private static function newToken(): string
    {
        do {
            $token = Str::lower(Str::random(self::TOKEN_LENGTH));
        } while (self::query()->where('token', $token)->exists());

        return $token;
    }
}
