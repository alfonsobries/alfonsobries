<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use NotificationChannels\Expo\ExpoPushToken;

class DeviceToken extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'expo_token',
        'platform',
        'last_used_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expo_token' => ExpoPushToken::class,
            'last_used_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
