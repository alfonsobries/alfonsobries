<?php

namespace App\AI;

use App\Models\Setting;
use InvalidArgumentException;

/**
 * The AI models selectable from the app settings, split into two kinds:
 * 'chat' (conversation/translation text models) and 'image' (illustrator
 * models). The active model per kind is a runtime setting so it can be
 * switched from the app without a deploy; the catalogs live in config
 * (site.chat.models and images.models).
 */
class ModelCatalog
{
    /**
     * @var array<string, array{models: string, default: string, setting: string}>
     */
    private const KINDS = [
        'chat' => [
            'models' => 'site.chat.models',
            'default' => 'site.chat.default_model',
            'setting' => 'chat_model',
        ],
        'image' => [
            'models' => 'images.models',
            'default' => 'images.default_model',
            'setting' => 'illustrator_model',
        ],
    ];

    /**
     * Every selectable model of a kind, cheapest first.
     *
     * @return list<array<string, mixed>>
     */
    public static function all(string $kind): array
    {
        /** @var array<string, array<string, mixed>> $models */
        $models = config(self::config($kind, 'models'), []);

        return collect($models)
            ->map(fn (array $entry, string $id): array => ['id' => $id, ...$entry])
            ->sortBy('price')
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function find(string $kind, string $id): ?array
    {
        $entry = config(self::config($kind, 'models').'.'.$id);

        return $entry === null ? null : ['id' => $id, ...$entry];
    }

    /**
     * @return array<string, mixed>
     */
    public static function active(string $kind): array
    {
        $selected = Setting::get(self::config($kind, 'setting'));

        if (is_string($selected) && ($entry = self::find($kind, $selected)) !== null) {
            return $entry;
        }

        return self::find($kind, (string) config(self::config($kind, 'default'))) ?? self::all($kind)[0];
    }

    public static function activate(string $kind, string $id): void
    {
        Setting::put(self::config($kind, 'setting'), $id);
    }

    /**
     * @return list<string>
     */
    public static function kinds(): array
    {
        return array_keys(self::KINDS);
    }

    private static function config(string $kind, string $key): string
    {
        if (! isset(self::KINDS[$kind])) {
            throw new InvalidArgumentException("Unknown model kind [{$kind}].");
        }

        return self::KINDS[$kind][$key];
    }
}
