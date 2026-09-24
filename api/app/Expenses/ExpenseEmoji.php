<?php

namespace App\Expenses;

/**
 * The emoji an expense can wear, by name. The assistant picks a name from this
 * catalog (names survive tokenization where raw emoji sometimes don't), and a
 * person can still choose any emoji by hand from the app.
 */
class ExpenseEmoji
{
    /**
     * @var array<string, array<string, string>>
     */
    public const GROUPS = [
        'Comida y bebida' => [
            'coffee' => '☕',
            'bubble_tea' => '🧋',
            'croissant' => '🥐',
            'bread' => '🍞',
            'doughnut' => '🍩',
            'ice_cream' => '🍦',
            'cake' => '🍰',
            'cookie' => '🍪',
            'taco' => '🌮',
            'burrito' => '🌯',
            'burger' => '🍔',
            'pizza' => '🍕',
            'fries' => '🍟',
            'hot_dog' => '🌭',
            'sushi' => '🍣',
            'ramen' => '🍜',
            'salad' => '🥗',
            'chicken' => '🍗',
            'meat' => '🥩',
            'fish' => '🐟',
            'fruit' => '🍎',
            'vegetables' => '🥦',
            'eggs' => '🥚',
            'milk' => '🥛',
            'cheese' => '🧀',
            'water' => '💧',
            'soda' => '🥤',
            'beer' => '🍺',
            'wine' => '🍷',
            'cocktail' => '🍸',
            'restaurant' => '🍽️',
            'snack' => '🍿',
            'candy' => '🍬',
        ],
        'Compras' => [
            'groceries' => '🛒',
            'shopping_bags' => '🛍️',
            'package' => '📦',
            'clothes' => '👕',
            'dress' => '👗',
            'shoes' => '👟',
            'glasses' => '👓',
            'jewelry' => '💍',
            'backpack' => '🎒',
            'gift' => '🎁',
            'flowers' => '💐',
            'books' => '📚',
            'stationery' => '✏️',
            'phone' => '📱',
            'computer' => '💻',
            'headphones' => '🎧',
            'electronics' => '🔌',
            'toys' => '🧸',
            'video_game' => '🎮',
        ],
        'Casa' => [
            'house' => '🏠',
            'rent' => '🔑',
            'furniture' => '🛋️',
            'bed' => '🛏️',
            'tools' => '🛠️',
            'cleaning' => '🧽',
            'laundry' => '🧺',
            'plant' => '🪴',
            'electricity' => '💡',
            'water_bill' => '🚰',
            'gas_bill' => '🔥',
            'internet' => '🌐',
            'phone_bill' => '📞',
            'streaming' => '📺',
            'subscription' => '🔁',
        ],
        'Transporte' => [
            'car' => '🚗',
            'taxi' => '🚕',
            'bus' => '🚌',
            'metro' => '🚇',
            'fuel' => '⛽',
            'parking' => '🅿️',
            'toll' => '🛣️',
            'car_repair' => '🔧',
            'bike' => '🚲',
            'plane' => '✈️',
            'hotel' => '🏨',
            'luggage' => '🧳',
            'beach' => '🏖️',
        ],
        'Salud y cuidado' => [
            'pill' => '💊',
            'doctor' => '🩺',
            'hospital' => '🏥',
            'dentist' => '🦷',
            'haircut' => '💈',
            'nails' => '💅',
            'cosmetics' => '💄',
            'soap' => '🧼',
            'gym' => '🏋️',
            'yoga' => '🧘',
            'baby' => '👶',
            'diapers' => '🍼',
        ],
        'Ocio y otros' => [
            'movie' => '🎬',
            'ticket' => '🎟️',
            'music' => '🎵',
            'party' => '🎉',
            'game' => '🎲',
            'sports' => '⚽',
            'pet' => '🐾',
            'school' => '🏫',
            'church' => '⛪',
            'donation' => '🤲',
            'bank' => '🏦',
            'taxes' => '🧾',
            'insurance' => '🛡️',
            'money' => '💵',
            'other' => '🪙',
        ],
    ];

    /**
     * @return array<string, string>
     */
    public static function all(): array
    {
        $all = [];

        foreach (self::GROUPS as $emojis) {
            $all = [...$all, ...$emojis];
        }

        return $all;
    }

    /**
     * The emoji for a catalog name, or null for a name that isn't in it.
     */
    public static function fromName(?string $name): ?string
    {
        if ($name === null) {
            return null;
        }

        return self::all()[strtolower(trim($name))] ?? null;
    }

    /**
     * The catalog as a compact prompt table: one line per group.
     */
    public static function promptTable(): string
    {
        return collect(self::GROUPS)
            ->map(fn (array $emojis, string $group): string => $group.': '.implode(', ', array_keys($emojis)))
            ->implode("\n");
    }
}
