<?php

declare(strict_types=1);

namespace App\Climate;

use Illuminate\Contracts\Cache\Repository as Cache;

/**
 * The home's air conditioners: their live state, what each model supports,
 * and the commands to change them.
 */
class Climate
{
    private const UNITS_CACHE_KEY = 'climate.units';

    public function __construct(
        private readonly CarrierClient $client,
        private readonly Cache $cache,
        private readonly AcFrame $frames = new AcFrame,
    ) {}

    public function isConfigured(): bool
    {
        return $this->client->isConfigured();
    }

    /**
     * Every unit with its current state. An unreachable unit comes back with
     * `state` null and `online` false instead of failing the whole list.
     *
     * @return list<array{id: string, name: string, online: bool, state: array<string, mixed>|null, capabilities: array<string, mixed>}>
     */
    public function units(): array
    {
        $appliances = $this->appliances();
        $replies = $this->client->sendMany(array_combine(
            array_column($appliances, 'id'),
            array_map(fn (): array => $this->frames->getState(), $appliances),
        ) ?: []);

        return array_map(function (array $appliance) use ($replies): array {
            $reply = $replies[$appliance['id']] ?? null;
            $state = is_array($reply) ? $this->frames->parseState($reply) : null;

            return $this->present($appliance, $state);
        }, $appliances);
    }

    /**
     * Applies a partial change to one unit and returns it as the unit confirms it.
     *
     * @param  array{power?: bool, target_temperature?: float|int, mode?: string, fan_speed?: string, swing?: string, eco?: bool, turbo?: bool, sleep?: bool}  $changes
     * @return array{id: string, name: string, online: bool, state: array<string, mixed>|null, capabilities: array<string, mixed>}
     */
    public function update(string $unitId, array $changes): array
    {
        $appliance = $this->appliance($unitId);
        $current = $this->state($unitId);
        $target = $current->with($changes);
        $capabilities = $this->capabilities($unitId);
        $target = $target->with(['target_temperature' => $this->clampTemperature($target->targetTemperature, $capabilities)]);

        $confirmed = $this->frames->parseState($this->client->send($unitId, $this->frames->setState($target))) ?? $target;

        return $this->present($appliance, $confirmed);
    }

    /**
     * Switches off every unit that is on and returns the ids it switched off.
     * Units that could not be reached are left out, so the caller can retry them.
     *
     * @return array{switched_off: list<string>, failed: list<string>}
     */
    public function turnOffAll(): array
    {
        $switchedOff = [];
        $failed = [];

        foreach ($this->units() as $unit) {
            if ($unit['state'] === null) {
                $failed[] = $unit['id'];

                continue;
            }

            if (! $unit['state']['power']) {
                continue;
            }

            try {
                $this->update($unit['id'], ['power' => false]);
                $switchedOff[] = $unit['id'];
            } catch (CarrierException $exception) {
                report($exception);
                $failed[] = $unit['id'];
            }
        }

        return ['switched_off' => $switchedOff, 'failed' => $failed];
    }

    /**
     * Switches the given units back on with the settings they had.
     *
     * @param  list<string>  $unitIds
     * @return list<string> the ids that came back on
     */
    public function turnOn(array $unitIds): array
    {
        $turnedOn = [];

        foreach ($unitIds as $unitId) {
            try {
                $this->update($unitId, ['power' => true]);
                $turnedOn[] = $unitId;
            } catch (CarrierException $exception) {
                report($exception);
            }
        }

        return $turnedOn;
    }

    public function state(string $unitId): AcState
    {
        $state = $this->frames->parseState($this->client->send($unitId, $this->frames->getState()));

        if ($state === null) {
            throw new CarrierException('The unit did not report its state.');
        }

        return $state;
    }

    public function capabilities(string $unitId): AcCapabilities
    {
        $cached = $this->cache->get("climate.capabilities.{$unitId}");

        if (is_array($cached)) {
            return AcCapabilities::fromArray($cached);
        }

        try {
            $hasMore = false;
            $records = $this->frames->parseCapabilityRecords($this->client->send($unitId, $this->frames->getCapabilities()), $hasMore);

            if ($records === null) {
                return AcCapabilities::defaults();
            }

            if ($hasMore) {
                $more = $this->frames->parseCapabilityRecords($this->client->send($unitId, $this->frames->getCapabilities(additional: true)));
                $records = array_replace($records, $more ?? []);
            }
        } catch (CarrierException $exception) {
            report($exception);

            return AcCapabilities::defaults();
        }

        $capabilities = AcCapabilities::fromRecords($records);
        $this->cache->forever("climate.capabilities.{$unitId}", $capabilities->toArray());

        return $capabilities;
    }

    /**
     * @return list<array{id: string, name: string, online: bool}>
     */
    public function appliances(): array
    {
        return $this->cache->remember(self::UNITS_CACHE_KEY, now()->addMinutes(10), fn (): array => $this->client->appliances());
    }

    /**
     * @return array{id: string, name: string, online: bool}
     */
    private function appliance(string $unitId): array
    {
        $appliance = array_find($this->appliances(), fn (array $item): bool => $item['id'] === $unitId);

        if ($appliance === null) {
            throw new CarrierException('Unknown air conditioner.');
        }

        return $appliance;
    }

    private function clampTemperature(float $temperature, AcCapabilities $capabilities): float
    {
        $step = $capabilities->halfDegrees ? 0.5 : 1.0;
        $rounded = round($temperature / $step) * $step;

        return min(max($rounded, $capabilities->minTemperature), $capabilities->maxTemperature);
    }

    /**
     * @param  array{id: string, name: string, online: bool}  $appliance
     * @return array{id: string, name: string, online: bool, state: array<string, mixed>|null, capabilities: array<string, mixed>}
     */
    private function present(array $appliance, ?AcState $state): array
    {
        return [
            'id' => $appliance['id'],
            'name' => $appliance['name'],
            'online' => $state !== null,
            'state' => $state?->toArray(),
            'capabilities' => $this->capabilities($appliance['id'])->toArray(),
        ];
    }
}
