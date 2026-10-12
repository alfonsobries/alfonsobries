<?php

declare(strict_types=1);

namespace App\Climate;

/**
 * What a particular unit supports, decoded from its `B5` report. Carrier models
 * differ (some have no Heat, no fan presets, whole degrees only), so the app
 * renders only what this lists.
 */
final readonly class AcCapabilities
{
    /**
     * @param  list<string>  $modes
     * @param  list<string>  $fanSpeeds
     * @param  list<string>  $swings
     */
    public function __construct(
        public array $modes,
        public array $fanSpeeds,
        public array $swings,
        public float $minTemperature,
        public float $maxTemperature,
        public bool $halfDegrees,
        public bool $eco,
        public bool $turbo,
    ) {}

    public static function defaults(): self
    {
        return new self(['cool', 'dry', 'fan', 'auto'], ['low', 'medium', 'high', 'auto'], ['off', 'vertical'], 16, 30, false, true, true);
    }

    /**
     * @param  array<int, list<int>>  $records
     */
    public static function fromRecords(array $records): self
    {
        $first = fn (int $id): ?int => $records[$id][0] ?? null;
        $in = fn (int $id, array $values): bool => in_array($first($id), $values, true);

        $modes = ['cool', 'dry', 'fan', 'auto'];
        $modeValue = $first(0x0214);

        if ($modeValue !== null) {
            $modes = array_values(array_filter([
                in_array($modeValue, [0, 1, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15], true) ? 'cool' : null,
                in_array($modeValue, [1, 2, 4, 6, 7, 9, 10, 11, 12, 13], true) ? 'heat' : null,
                in_array($modeValue, [0, 1, 5, 6, 9, 11, 13, 14, 15], true) ? 'dry' : null,
                'fan',
                in_array($modeValue, [0, 1, 2, 7, 8, 9, 13, 14], true) ? 'auto' : null,
            ]));
        }

        $fanSpeeds = ['low', 'medium', 'high', 'auto'];
        $fanValue = $first(0x0210);

        if ($fanValue !== null) {
            $custom = $fanValue === 1;
            $fanSpeeds = array_values(array_filter([
                $custom || in_array($fanValue, [6, 9], true) ? 'silent' : null,
                $custom || in_array($fanValue, [3, 4, 5, 6, 7, 9], true) ? 'low' : null,
                $custom || in_array($fanValue, [5, 6, 7], true) ? 'medium' : null,
                $custom || in_array($fanValue, [3, 4, 5, 6, 7, 9], true) ? 'high' : null,
                $custom ? 'max' : null,
                $custom || in_array($fanValue, [4, 5, 6, 9], true) ? 'auto' : null,
            ]));
        }

        $swings = ['off', 'vertical'];
        $swingValue = $first(0x0215);

        if ($swingValue !== null) {
            $vertical = in_array($swingValue, [0, 1], true);
            $horizontal = in_array($swingValue, [1, 3], true);
            $swings = array_values(array_filter([
                'off',
                $vertical ? 'vertical' : null,
                $horizontal ? 'horizontal' : null,
                $vertical && $horizontal ? 'both' : null,
            ]));
        }

        $min = 16.0;
        $max = 30.0;
        $half = true;
        $temperatures = $records[0x0225] ?? [];

        if (count($temperatures) >= 6) {
            $min = min($temperatures[0], $temperatures[2], $temperatures[4]) * 0.5;
            $max = max($temperatures[1], $temperatures[3], $temperatures[5]) * 0.5;
            $half = (count($temperatures) > 6 ? $temperatures[6] : count($temperatures)) !== 0;
        }

        return new self(
            modes: $modes,
            fanSpeeds: $fanSpeeds,
            swings: $swings,
            minTemperature: $min,
            maxTemperature: $max,
            halfDegrees: $half,
            eco: $in(0x0212, [1, 2]),
            turbo: $in(0x021A, [0, 1, 3]),
        );
    }

    /**
     * @return array{modes: list<string>, fan_speeds: list<string>, swings: list<string>, min_temperature: float, max_temperature: float, half_degrees: bool, eco: bool, turbo: bool}
     */
    public function toArray(): array
    {
        return [
            'modes' => $this->modes,
            'fan_speeds' => $this->fanSpeeds,
            'swings' => $this->swings,
            'min_temperature' => $this->minTemperature,
            'max_temperature' => $this->maxTemperature,
            'half_degrees' => $this->halfDegrees,
            'eco' => $this->eco,
            'turbo' => $this->turbo,
        ];
    }

    /**
     * @param  array{modes: list<string>, fan_speeds: list<string>, swings: list<string>, min_temperature: float|int, max_temperature: float|int, half_degrees: bool, eco: bool, turbo: bool}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self($data['modes'], $data['fan_speeds'], $data['swings'], (float) $data['min_temperature'], (float) $data['max_temperature'], $data['half_degrees'], $data['eco'], $data['turbo']);
    }
}
