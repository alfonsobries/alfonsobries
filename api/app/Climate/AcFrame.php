<?php

declare(strict_types=1);

namespace App\Climate;

/**
 * Midea air conditioner frames: the `AA` messages Carrier units speak.
 *
 * Layout: `AA | length | 0xAC | 5 reserved | protocol | frame type | payload | checksum`,
 * where command payloads end in a rolling message id and a CRC-8/MAXIM.
 */
class AcFrame
{
    public const DEVICE_TYPE = 0xAC;

    public const CONTROL = 0x02;

    public const QUERY = 0x03;

    /** @var list<int>|null */
    private ?array $crcTable = null;

    public function __construct(private int $messageId = 0) {}

    /**
     * @return list<int>
     */
    public function getState(): array
    {
        return $this->command(self::QUERY, [0x41, 0x81, 0x00, 0xFF, 0x03, 0xFF, 0x00, 0x02, ...array_fill(0, 12, 0), 0x03]);
    }

    /**
     * @return list<int>
     */
    public function getCapabilities(bool $additional = false): array
    {
        return $this->command(self::QUERY, $additional ? [0xB5, 0x01, 0x01, 0x01] : [0xB5, 0x01, 0x00]);
    }

    /**
     * @return list<int>
     */
    public function setState(AcState $state): array
    {
        $integral = (int) floor($state->targetTemperature);
        $half = $state->targetTemperature - $integral > 0;
        $temperature = 0;
        $temperatureAlt = 0;

        if ($integral >= 17 && $integral <= 30) {
            $temperature = ($integral - 16) & 0x0F;
        } else {
            $temperatureAlt = max($integral - 12, 0) & 0x1F;
        }

        if ($half) {
            $temperature |= 0x10;
        }

        $body = array_fill(0, 24, 0);
        $body[0] = 0x40;
        $body[1] = 0x02 | ($state->power ? 0x01 : 0);
        $body[2] = $temperature | (($state->mode->value & 0x07) << 5);
        $body[3] = $state->fanSpeed;
        $body[4] = 0x7F;
        $body[5] = 0x7F;
        $body[7] = 0x30 | ($state->swing & 0x3F);
        $body[8] = $state->turbo ? 0x20 : 0;
        $body[9] = $state->eco ? 0x80 : 0;
        $body[10] = ($state->sleep ? 0x01 : 0) | ($state->turbo ? 0x02 : 0);
        $body[18] = $temperatureAlt;
        $body[19] = 40;

        return $this->command(self::CONTROL, $body);
    }

    /**
     * Decodes a `C0` state report, or returns null for any other message.
     *
     * @param  list<int>  $frame
     */
    public function parseState(array $frame): ?AcState
    {
        $payload = $this->payload($frame, 0xC0);

        if ($payload === null || count($payload) < 17) {
            return null;
        }

        $half = ($payload[2] & 0x10) !== 0 ? 0.5 : 0.0;
        $target = ($payload[2] & 0x0F) + 16 + $half;
        $alt = $payload[13] & 0x1F;

        if ($alt !== 0) {
            $target = $alt + 12 + $half;
        }

        return new AcState(
            power: ($payload[1] & 0x01) !== 0,
            targetTemperature: $target,
            mode: AcMode::tryFrom(($payload[2] >> 5) & 0x07) ?? AcMode::Fan,
            fanSpeed: $payload[3] & 0x7F,
            swing: $payload[7] & 0x0F,
            eco: ($payload[9] & 0x10) !== 0,
            turbo: ($payload[8] & 0x20) !== 0 || ($payload[10] & 0x02) !== 0,
            sleep: ($payload[10] & 0x01) !== 0,
            indoorTemperature: $this->sensor($payload[11], ($payload[15] & 0x0F) / 10),
            outdoorTemperature: $this->sensor($payload[12], ($payload[15] >> 4) / 10),
        );
    }

    /**
     * Decodes a `B5` capability report into the subset the app adapts to.
     *
     * @param  list<int>  $frame
     * @return array<int, list<int>>|null raw records keyed by capability id
     */
    public function parseCapabilityRecords(array $frame, ?bool &$hasMore = null): ?array
    {
        $payload = $this->payload($frame, 0xB5);

        if ($payload === null || count($payload) < 2) {
            return null;
        }

        $records = [];
        $cursor = 2;

        for ($i = 0; $i < $payload[1]; $i++) {
            if (count($payload) - $cursor < 3) {
                break;
            }

            $id = $payload[$cursor] | ($payload[$cursor + 1] << 8);
            $size = $payload[$cursor + 2];
            $end = min($cursor + 3 + $size, count($payload));

            if ($size > 0) {
                $records[$id] = array_slice($payload, $cursor + 3, $end - $cursor - 3);
            }

            $cursor = $end;
        }

        $hasMore = count($payload) - $cursor > 1 && $payload[count($payload) - 2] !== 0;

        return $records;
    }

    /**
     * @param  list<int>  $body
     * @return list<int>
     */
    public function command(int $type, array $body): array
    {
        $this->messageId = ($this->messageId + 1) & 0xFF;
        $payload = [...$body, $this->messageId];
        $payload[] = $this->crc8($payload);

        $frame = [0xAA, count($payload) + 10, self::DEVICE_TYPE, 0, 0, 0, 0, 0, 0, $type, ...$payload];
        $frame[] = $this->checksum(array_slice($frame, 1));

        return $frame;
    }

    /**
     * @param  list<int>  $bytes
     */
    public function checksum(array $bytes): int
    {
        return (~array_sum($bytes) + 1) & 0xFF;
    }

    /**
     * @param  list<int>  $bytes
     */
    public function crc8(array $bytes): int
    {
        $table = $this->crcTable ??= $this->buildCrcTable();
        $crc = 0;

        foreach ($bytes as $byte) {
            $crc = $table[($crc ^ $byte) & 0xFF];
        }

        return $crc;
    }

    /**
     * Validates the frame and returns its payload without the trailing CRC, when the id matches.
     *
     * @param  list<int>  $frame
     * @return list<int>|null
     */
    private function payload(array $frame, int $id): ?array
    {
        if (count($frame) < 12 || $frame[0] !== 0xAA || $frame[2] !== self::DEVICE_TYPE) {
            return null;
        }

        if ($this->checksum(array_slice($frame, 1, -1)) !== $frame[count($frame) - 1] || $frame[10] !== $id) {
            return null;
        }

        $body = array_slice($frame, 10, -1);
        $content = array_slice($body, 0, -1);
        $received = $body[count($body) - 1];

        // Older firmware puts a sum checksum where newer firmware puts the CRC.
        if ($this->crc8($content) !== $received && $this->checksum($content) !== $received) {
            return null;
        }

        return $content;
    }

    /**
     * Sensor bytes are `(raw - 50) / 2` °C, with an optional tenths nibble.
     */
    private function sensor(int $raw, float $decimals): ?float
    {
        if ($raw === 0xFF) {
            return null;
        }

        $value = ($raw - 50) / 2;
        $whole = $value < 0 ? ceil($value) : floor($value);

        if ($decimals > 0) {
            return round($whole + ($value >= 0 ? $decimals : -$decimals), 1);
        }

        return $value;
    }

    /**
     * @return list<int>
     */
    private function buildCrcTable(): array
    {
        $table = [];

        for ($value = 0; $value < 256; $value++) {
            $crc = $value;

            for ($bit = 0; $bit < 8; $bit++) {
                $crc = ($crc & 1) === 1 ? ($crc >> 1) ^ 0x8C : $crc >> 1;
            }

            $table[] = $crc;
        }

        return $table;
    }
}
