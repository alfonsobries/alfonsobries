<?php

declare(strict_types=1);

namespace App\Climate;

/**
 * What an air conditioner reports about itself, and what a control command sets.
 */
final readonly class AcState
{
    /**
     * Fan speeds the units name; anything else is a custom percentage.
     */
    public const FAN_SPEEDS = ['silent' => 20, 'low' => 40, 'medium' => 60, 'high' => 80, 'max' => 100, 'auto' => 102];

    public const SWINGS = ['off' => 0x0, 'horizontal' => 0x3, 'vertical' => 0xC, 'both' => 0xF];

    public function __construct(
        public bool $power,
        public float $targetTemperature,
        public AcMode $mode,
        public int $fanSpeed,
        public int $swing,
        public bool $eco,
        public bool $turbo,
        public bool $sleep,
        public ?float $indoorTemperature = null,
        public ?float $outdoorTemperature = null,
    ) {}

    /**
     * Applies a validated partial update coming from the app.
     *
     * @param  array{power?: bool, target_temperature?: float|int, mode?: string, fan_speed?: string, swing?: string, eco?: bool, turbo?: bool, sleep?: bool}  $changes
     */
    public function with(array $changes): self
    {
        $mode = isset($changes['mode']) ? AcMode::fromName($changes['mode']) : $this->mode;
        $turbo = $changes['turbo'] ?? $this->turbo;
        $eco = $changes['eco'] ?? $this->eco;

        // Eco and Turbo are opposites on the units; turning one on clears the other.
        if (($changes['turbo'] ?? false) === true) {
            $eco = false;
        }

        if (($changes['eco'] ?? false) === true) {
            $turbo = false;
        }

        return new self(
            power: $changes['power'] ?? $this->power,
            targetTemperature: isset($changes['target_temperature']) ? (float) $changes['target_temperature'] : $this->targetTemperature,
            mode: $mode,
            fanSpeed: isset($changes['fan_speed']) ? self::FAN_SPEEDS[$changes['fan_speed']] : $this->fanSpeed,
            swing: isset($changes['swing']) ? self::SWINGS[$changes['swing']] : $this->swing,
            eco: $eco,
            turbo: $turbo,
            sleep: $changes['sleep'] ?? $this->sleep,
            indoorTemperature: $this->indoorTemperature,
            outdoorTemperature: $this->outdoorTemperature,
        );
    }

    /**
     * @return array{power: bool, target_temperature: float, mode: string, fan_speed: string, swing: string, eco: bool, turbo: bool, sleep: bool, indoor_temperature: float|null, outdoor_temperature: float|null}
     */
    public function toArray(): array
    {
        return [
            'power' => $this->power,
            'target_temperature' => $this->targetTemperature,
            'mode' => $this->mode->key(),
            'fan_speed' => $this->fanSpeedName(),
            'swing' => array_search($this->swing, self::SWINGS, true) ?: 'off',
            'eco' => $this->eco,
            'turbo' => $this->turbo,
            'sleep' => $this->sleep,
            'indoor_temperature' => $this->indoorTemperature,
            'outdoor_temperature' => $this->outdoorTemperature,
        ];
    }

    private function fanSpeedName(): string
    {
        $exact = array_search($this->fanSpeed, self::FAN_SPEEDS, true);

        if ($exact !== false) {
            return $exact;
        }

        if ($this->fanSpeed > 100) {
            return 'auto';
        }

        $named = array_filter(self::FAN_SPEEDS, fn (int $speed): bool => $speed <= 100);
        uasort($named, fn (int $a, int $b): int => abs($a - $this->fanSpeed) <=> abs($b - $this->fanSpeed));

        return (string) array_key_first($named);
    }
}
