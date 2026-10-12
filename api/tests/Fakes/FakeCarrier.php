<?php

declare(strict_types=1);

namespace Tests\Fakes;

use App\Climate\AcFrame;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

/**
 * A stand-in for the Carrier cloud that speaks the real protocol: it decrypts
 * relayed orders, applies `AA` control frames to in-memory units and answers
 * with encoded state reports.
 */
class FakeCarrier
{
    private const APP_KEY = '1eaea8e99fac82bbb5a240b9781c7d8d';

    private const DATA_KEY = '0123456789abcdef';

    /** Units that answer as unreachable. */
    public array $offline = [];

    public int $logins = 0;

    /** @var list<array{unit: string, frame: list<int>}> */
    public array $commands = [];

    /** Ends the session on the next relayed command, as a phone signing in would. */
    public bool $endSessionOnce = false;

    /**
     * @param  array<string, array{name: string, power: bool, temperature: float, mode: int, fan: int, indoor: float}>  $units
     */
    public function __construct(public array $units) {}

    /**
     * @param  array<string, array{name: string, power: bool, temperature: float, mode: int, fan: int, indoor: float}>  $units
     */
    public static function install(array $units): self
    {
        config([
            'services.carrier.email' => 'casa@example.com',
            'services.carrier.password' => 'secret',
            'services.carrier.base_url' => 'https://carrier.test',
        ]);

        $fake = new self($units);
        Http::fake(['carrier.test/*' => fn (Request $request) => $fake->handle($request)]);

        return $fake;
    }

    public static function unit(string $name, bool $power = false, float $temperature = 24, int $mode = 2, int $fan = 102, float $indoor = 28): array
    {
        return compact('name', 'power', 'temperature', 'mode', 'fan', 'indoor');
    }

    public function handle(Request $request): mixed
    {
        $path = parse_url($request->url(), PHP_URL_PATH);
        $data = $request->data();

        return match ($path) {
            '/v1/user/login/id/get' => $this->ok(['loginId' => 'login-id']),
            '/v1/user/login' => $this->login(),
            '/v1/appliance/user/list/get' => $this->ok(['list' => array_map(
                fn (string $id, array $unit): array => ['id' => $id, 'name' => $unit['name'], 'type' => '0xAC', 'onlineStatus' => '1'],
                array_keys($this->units),
                $this->units,
            )]),
            '/v1/appliance/transparent/send' => $this->relay((string) $data['applianceId'], (string) $data['order']),
            default => Http::response(['errorCode' => '9999', 'msg' => 'unknown'], 200),
        };
    }

    private function login(): mixed
    {
        $this->logins++;
        $token = bin2hex((string) openssl_encrypt(self::DATA_KEY, 'aes-128-ecb', substr(md5(self::APP_KEY), 0, 16), OPENSSL_RAW_DATA));

        return $this->ok(['sessionId' => "session-{$this->logins}", 'accessToken' => $token, 'userId' => '1']);
    }

    private function relay(string $unitId, string $order): mixed
    {
        if ($this->endSessionOnce) {
            $this->endSessionOnce = false;

            return Http::response(['errorCode' => '3106', 'msg' => 'invalidSession']);
        }

        if (in_array($unitId, $this->offline, true)) {
            return Http::response(['errorCode' => '3123', 'msg' => 'device offline']);
        }

        $csv = (string) openssl_decrypt((string) hex2bin($order), 'aes-128-ecb', self::DATA_KEY, OPENSSL_RAW_DATA);
        $packet = array_map(fn (string $value): int => ((int) $value + 256) % 256, explode(',', $csv));
        $frame = array_slice($packet, 40, $packet[41] + 1);
        $this->commands[] = ['unit' => $unitId, 'frame' => $frame];

        $reply = match ($frame[10]) {
            0x40 => $this->apply($unitId, $frame),
            0xB5 => array_map(hexdec(...), str_split('aa29ac00000000000303b5071202010113020101140201011502010116020101170201001a020101dedb', 2)),
            default => $this->stateFrame($unitId),
        };

        $replyPacket = [...array_fill(0, 40, 0), ...$reply, ...array_fill(0, 16, 0)];
        $replyCsv = implode(',', array_map(fn (int $byte): int => $byte > 127 ? $byte - 256 : $byte, $replyPacket));

        return $this->ok(['reply' => bin2hex((string) openssl_encrypt($replyCsv, 'aes-128-ecb', self::DATA_KEY, OPENSSL_RAW_DATA))]);
    }

    /**
     * @param  list<int>  $frame
     * @return list<int>
     */
    private function apply(string $unitId, array $frame): array
    {
        $body = array_slice($frame, 10);
        $alt = $body[18] & 0x1F;
        $this->units[$unitId] = [
            ...$this->units[$unitId],
            'power' => ($body[1] & 0x01) === 1,
            'temperature' => ($alt !== 0 ? $alt + 12 : ($body[2] & 0x0F) + 16) + (($body[2] & 0x10) !== 0 ? 0.5 : 0),
            'mode' => ($body[2] >> 5) & 0x07,
            'fan' => $body[3],
        ];

        return $this->stateFrame($unitId);
    }

    /**
     * @return list<int>
     */
    private function stateFrame(string $unitId): array
    {
        $unit = $this->units[$unitId];
        $whole = (int) floor($unit['temperature']);
        $payload = array_fill(0, 22, 0);
        $payload[0] = 0xC0;
        $payload[1] = $unit['power'] ? 0x01 : 0;
        $payload[2] = (($whole - 16) & 0x0F) | (($unit['temperature'] - $whole) > 0 ? 0x10 : 0) | ($unit['mode'] << 5);
        $payload[3] = $unit['fan'];
        $payload[11] = (int) ($unit['indoor'] * 2 + 50);
        $payload[12] = 0xFF;

        return $this->frame($payload);
    }

    /**
     * @param  list<int>  $payload
     * @return list<int>
     */
    private function frame(array $payload): array
    {
        $codec = new AcFrame;
        $body = [...$payload, $codec->crc8($payload)];
        $frame = [0xAA, count($body) + 10, 0xAC, 0, 0, 0, 0, 0, 0, 0x03, ...$body];
        $frame[] = $codec->checksum(array_slice($frame, 1));

        return $frame;
    }

    private function ok(array $result): mixed
    {
        return Http::response(['errorCode' => '0', 'msg' => 'ok', 'result' => $result]);
    }
}
