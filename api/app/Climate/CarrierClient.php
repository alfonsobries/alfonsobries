<?php

declare(strict_types=1);

namespace App\Climate;

use Illuminate\Contracts\Cache\Repository as Cache;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * Client for the cloud behind the Carrier Air Conditioner app (`com.midea.carrier`):
 * Midea's NetHome API under Carrier's app id and key. Units are controlled by
 * relaying raw appliance frames through `/v1/appliance/transparent/send`.
 *
 * Carrier allows one session per account, so a phone signing in with the same
 * account ends this session; the client signs in again and retries once.
 */
class CarrierClient
{
    public const APP_ID = '1106';

    private const APP_KEY = '1eaea8e99fac82bbb5a240b9781c7d8d';

    private const SIGN_KEY = 'xhdiwjnchekd4d512chdjx5d8e4c394D2D7S';

    public function __construct(private readonly Cache $cache) {}

    public function isConfigured(): bool
    {
        return (string) config('services.carrier.email') !== '' && (string) config('services.carrier.password') !== '';
    }

    /**
     * @return list<array{id: string, name: string, online: bool}>
     */
    public function appliances(): array
    {
        $result = $this->authenticated('/v1/appliance/user/list/get', []);
        $list = is_array($result['list'] ?? null) ? $result['list'] : [];

        return array_values(array_map(fn (array $item): array => [
            'id' => (string) $item['id'],
            'name' => trim((string) ($item['name'] ?? '')),
            'online' => (string) ($item['onlineStatus'] ?? '1') === '1',
        ], array_filter($list, fn (mixed $item): bool => is_array($item) && strtoupper((string) ($item['type'] ?? '')) === '0XAC')));
    }

    /**
     * Relays a frame to a unit and returns the unit's reply frame.
     *
     * @param  list<int>  $frame
     * @return list<int>
     */
    public function send(string $applianceId, array $frame): array
    {
        $reply = $this->sendMany([$applianceId => $frame])[$applianceId];

        // The relay sometimes loses a unit's answer ("async reply does not exist"); ask once more.
        if ($reply instanceof CarrierException && ! $reply->isUnitOffline()) {
            $reply = $this->sendMany([$applianceId => $frame])[$applianceId];
        }

        if ($reply instanceof CarrierException) {
            throw $reply;
        }

        return $reply;
    }

    /**
     * Relays one frame per unit, concurrently. A unit that fails gets its exception
     * in place of a reply, so one offline unit doesn't hide the others.
     *
     * @param  array<string, list<int>>  $frames  keyed by appliance id
     * @return array<string, list<int>|CarrierException>
     */
    public function sendMany(array $frames): array
    {
        return $this->withSession(function (array $session) use ($frames): array {
            $key = $this->dataKey($session['accessToken']);
            $path = '/v1/appliance/transparent/send';
            $bodies = [];

            foreach ($frames as $applianceId => $frame) {
                $packet = $this->plainPacket((string) $applianceId, $frame);
                $csv = implode(',', array_map(fn (int $byte): int => $byte > 127 ? $byte - 256 : $byte, $packet));
                $bodies[(string) $applianceId] = $this->body($path, [
                    'order' => bin2hex((string) openssl_encrypt($csv, 'aes-128-ecb', $key, OPENSSL_RAW_DATA)),
                    'funId' => '0000',
                    'applianceId' => (string) $applianceId,
                ], $session['sessionId']);
            }

            $responses = Http::pool(fn (Pool $pool): array => array_map(
                fn (string $applianceId): mixed => $pool->as($applianceId)->asForm()->timeout(15)
                    ->baseUrl((string) config('services.carrier.base_url'))
                    ->post($path, $bodies[$applianceId]),
                array_keys($bodies),
            ));

            $replies = [];

            foreach (array_keys($bodies) as $applianceId) {
                try {
                    $result = $this->parse($responses[$applianceId] ?? null);
                    $replies[$applianceId] = $this->decodeReply((string) ($result['reply'] ?? ''), $key);
                } catch (CarrierException $exception) {
                    if ($exception->isSessionEnded()) {
                        throw $exception;
                    }

                    $replies[$applianceId] = $exception;
                }
            }

            return $replies;
        });
    }

    /**
     * @return list<int>
     */
    private function decodeReply(string $hex, string $key): array
    {
        $reply = openssl_decrypt((string) hex2bin($hex), 'aes-128-ecb', $key, OPENSSL_RAW_DATA);

        if ($reply === false) {
            throw new CarrierException('Unreadable reply from the unit.');
        }

        $bytes = array_map(fn (string $value): int => ((int) $value + 256) % 256, explode(',', $reply));
        $frame = array_slice($bytes, 40);

        if (count($frame) < 12 || $frame[0] !== 0xAA) {
            throw new CarrierException('The unit replied without a frame.');
        }

        return array_slice($frame, 0, $frame[1] + 1);
    }

    /**
     * @param  array<string, string>  $fields
     * @return array<string, mixed>
     */
    private function authenticated(string $path, array $fields): array
    {
        return $this->withSession(fn (array $session): array => $this->request($path, $fields, $session['sessionId']));
    }

    /**
     * Runs a call with the cached session, signing in again once if Carrier ended it.
     *
     * @template T
     *
     * @param  callable(array{sessionId: string, accessToken: string}): T  $call
     * @return T
     */
    private function withSession(callable $call): mixed
    {
        try {
            return $call($this->session());
        } catch (CarrierException $exception) {
            if (! $exception->isSessionEnded()) {
                throw $exception;
            }

            $this->cache->forget($this->sessionCacheKey());

            return $call($this->session());
        }
    }

    /**
     * Scoped to the account, so changing the configured account never reuses another one's session.
     */
    private function sessionCacheKey(): string
    {
        return 'climate.carrier.session.'.sha1((string) config('services.carrier.email'));
    }

    /**
     * @return array{sessionId: string, accessToken: string}
     */
    private function session(): array
    {
        /** @var array{sessionId: string, accessToken: string}|null $session */
        $session = $this->cache->get($this->sessionCacheKey());

        if ($session !== null) {
            return $session;
        }

        if (! $this->isConfigured()) {
            throw new CarrierException('Carrier credentials are not configured.');
        }

        $email = (string) config('services.carrier.email');
        $loginId = (string) ($this->request('/v1/user/login/id/get', ['loginAccount' => $email])['loginId'] ?? '');
        $hashed = hash('sha256', (string) config('services.carrier.password'));
        $result = $this->request('/v1/user/login', [
            'loginAccount' => $email,
            'password' => hash('sha256', $loginId.$hashed.self::APP_KEY),
        ]);

        $session = [
            'sessionId' => (string) ($result['sessionId'] ?? ''),
            'accessToken' => (string) ($result['accessToken'] ?? ''),
        ];

        if ($session['sessionId'] === '' || $session['accessToken'] === '') {
            throw new CarrierException('Carrier did not return a session.');
        }

        $this->cache->put($this->sessionCacheKey(), $session, now()->addDays(7));

        return $session;
    }

    /**
     * @param  array<string, string>  $fields
     * @return array<string, mixed>
     */
    private function request(string $path, array $fields, string $sessionId = ''): array
    {
        try {
            $response = Http::asForm()
                ->timeout(15)
                ->baseUrl((string) config('services.carrier.base_url'))
                ->post($path, $this->body($path, $fields, $sessionId));
        } catch (ConnectionException $exception) {
            throw new CarrierException('Carrier is unreachable.', 0, $exception);
        }

        return $this->parse($response);
    }

    /**
     * @param  array<string, string>  $fields
     * @return array<string, string>
     */
    private function body(string $path, array $fields, string $sessionId): array
    {
        $body = [
            ...$fields,
            'appId' => self::APP_ID,
            'src' => self::APP_ID,
            'format' => '2',
            'clientType' => '1',
            'language' => 'en_US',
            'deviceId' => substr(hash('sha256', (string) config('app.key')), 0, 16),
            'stamp' => now('UTC')->format('YmdHis'),
            'sessionId' => $sessionId,
        ];
        $body['sign'] = $this->sign($path, $body);

        return $body;
    }

    /**
     * @return array<string, mixed>
     */
    private function parse(mixed $response): array
    {
        if (! $response instanceof Response) {
            throw new CarrierException('Carrier is unreachable.');
        }

        $json = $response->json();

        if (! $response->successful() || ! is_array($json)) {
            throw new CarrierException("Carrier answered HTTP {$response->status()}.");
        }

        $code = (int) ($json['errorCode'] ?? -1);

        if ($code !== 0) {
            throw new CarrierException((string) ($json['msg'] ?? 'Carrier error'), $code);
        }

        return is_array($json['result'] ?? null) ? $json['result'] : [];
    }

    /**
     * @param  array<string, string>  $fields
     */
    public function sign(string $path, array $fields): string
    {
        ksort($fields);
        $query = implode('&', array_map(fn (string $key, string $value): string => "{$key}={$value}", array_keys($fields), $fields));

        return hash('sha256', $path.$query.self::APP_KEY);
    }

    /**
     * The access token is the session's data key, encrypted under MD5(app key)[0..16].
     */
    private function dataKey(string $accessToken): string
    {
        $key = openssl_decrypt((string) hex2bin($accessToken), 'aes-128-ecb', substr(md5(self::APP_KEY), 0, 16), OPENSSL_RAW_DATA);

        if ($key === false) {
            throw new CarrierException('Unreadable Carrier access token.', CarrierException::SESSION_ENDED[0]);
        }

        return $key;
    }

    /**
     * A `5A5A` packet carrying the frame in clear, as the relay expects.
     *
     * @param  list<int>  $frame
     * @return list<int>
     */
    public function plainPacket(string $applianceId, array $frame): array
    {
        $now = now('UTC');
        $id = (int) $applianceId;
        $idBytes = array_map(fn (int $shift): int => ($id >> $shift) & 0xFF, [0, 8, 16, 24, 32, 40, 48, 56]);

        $packet = [
            0x5A, 0x5A, 0x01, 0x11, 0x00, 0x00, 0x20, 0x00, 0, 0, 0, 0,
            intdiv((int) $now->format('u'), 10000), (int) $now->format('s'), (int) $now->format('i'), (int) $now->format('G'),
            (int) $now->format('j'), (int) $now->format('n'), (int) $now->format('Y') % 100, intdiv((int) $now->format('Y'), 100),
            ...$idBytes,
            ...array_fill(0, 12, 0),
            ...$frame,
        ];

        $length = count($packet) + 16;
        $packet[4] = $length & 0xFF;
        $packet[5] = ($length >> 8) & 0xFF;

        $signature = md5(pack('C*', ...$packet).self::SIGN_KEY, true);

        return [...$packet, ...array_values(unpack('C*', $signature) ?: [])];
    }
}
