<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A tiny key-value store for runtime app settings that must survive deploys
 * without an env change — e.g. the active illustrator model.
 */
class Setting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'json',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::find($key)->value ?? $default;
    }

    public static function put(string $key, mixed $value): void
    {
        self::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
