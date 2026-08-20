<?php

namespace App\Services\Line;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Thin wrapper over the privacynumber.io REST API. The secret key never
 * leaves the server; every app-facing feature goes through the Laravel API.
 */
class PrivacyNumberClient
{
    /**
     * Pinned API version (the provider supports dated versions for 24+ months).
     */
    public const VERSION = '2026-04-01';

    public function isConfigured(): bool
    {
        return (string) config('services.privacynumber.key') !== '';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function numbers(): array
    {
        return $this->list($this->request()->get('/numbers'));
    }

    /**
     * @return array<string, mixed>
     */
    public function number(string $id): array
    {
        return $this->object($this->request()->get("/numbers/{$id}"));
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function updateNumber(string $id, array $attributes): array
    {
        return $this->object($this->request()->patch("/numbers/{$id}", $attributes));
    }

    /**
     * @return array<string, mixed>
     */
    public function aiConfig(string $id): array
    {
        return $this->object($this->request()->get("/numbers/{$id}/ai"));
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function updateAiConfig(string $id, array $attributes): array
    {
        return $this->object($this->request()->patch("/numbers/{$id}/ai", $attributes));
    }

    /**
     * @return array<string, mixed>
     */
    public function sendSms(string $from, string $to, string $body, ?string $scheduledAt, string $idempotencyKey): array
    {
        $payload = array_filter([
            'from' => $from,
            'to' => $to,
            'body' => $body,
            'scheduled_at' => $scheduledAt,
        ], fn (?string $value): bool => $value !== null);

        return $this->object(
            $this->request()
                ->withHeaders(['Idempotency-Key' => $idempotencyKey])
                ->post('/sms', $payload)
        );
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<int, array<string, mixed>>
     */
    public function listSms(array $query = []): array
    {
        return $this->list($this->request()->get('/sms', $query));
    }

    /**
     * @return array<string, mixed>
     */
    public function createCall(string $from, string $to, string $calleridMask): array
    {
        return $this->object($this->request()->post('/calls', [
            'from' => $from,
            'to' => $to,
            'callerid_mask' => $calleridMask,
        ]));
    }

    /**
     * @return array<string, mixed>
     */
    public function call(string $id): array
    {
        return $this->object($this->request()->get("/calls/{$id}"));
    }

    public function hangup(string $id): void
    {
        $this->object($this->request()->post("/calls/{$id}/hangup"));
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<int, array<string, mixed>>
     */
    public function listCalls(array $query = []): array
    {
        return $this->list($this->request()->get('/calls', $query));
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<int, array<string, mixed>>
     */
    public function voicemails(array $query = []): array
    {
        return $this->list($this->request()->get('/voicemails', $query));
    }

    /**
     * @return array<string, mixed>
     */
    public function voicemail(string $id): array
    {
        return $this->object($this->request()->get("/voicemails/{$id}"));
    }

    public function deleteVoicemail(string $id): void
    {
        $response = $this->request()->delete("/voicemails/{$id}");

        if ($response->failed()) {
            throw PrivacyNumberException::fromResponse($response);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function account(): array
    {
        return $this->object($this->request()->get('/account'));
    }

    /**
     * @return array<string, mixed>
     */
    public function usage(): array
    {
        return $this->object($this->request()->get('/account/usage'));
    }

    private function request(): PendingRequest
    {
        return Http::baseUrl((string) config('services.privacynumber.base_url'))
            ->withToken((string) config('services.privacynumber.key'))
            ->withHeaders(['PrivacyNumber-Version' => self::VERSION])
            ->acceptJson()
            ->timeout(15)
            ->connectTimeout(5)
            ->retry(3, 500, function (Throwable $exception): bool {
                if ($exception instanceof ConnectionException) {
                    return true;
                }

                if (! $exception instanceof RequestException) {
                    return false;
                }

                $status = $exception->response->status();

                return $status === 429 || $status >= 500;
            }, throw: false);
    }

    /**
     * @return array<string, mixed>
     */
    private function object(Response $response): array
    {
        if ($response->failed()) {
            throw PrivacyNumberException::fromResponse($response);
        }

        return $response->json() ?? [];
    }

    /**
     * List endpoints wrap the items in `data` alongside pagination cursors.
     *
     * @return array<int, array<string, mixed>>
     */
    private function list(Response $response): array
    {
        return $this->object($response)['data'] ?? [];
    }
}
