<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Availability\AvailabilitySchedule;
use App\Availability\Mode;
use App\Availability\PushError;
use App\Availability\PushStatus;
use App\Models\SupportBrand;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Sends the current availability rules to one brand, signed with its
 * secret: `X-Availability-Signature: sha256=<hmac("{ts}.{body}")>`. The
 * rules are read when the job runs, not when it was queued, so a late retry
 * never sends an older version than the latest.
 *
 * A server error or a dropped connection retries; a 4xx means the brand
 * rejected the push (bad secret, bad shape) and retrying would not help.
 */
class PushAvailabilityToBrand implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /**
     * @var list<int>
     */
    public array $backoff = [10, 60];

    public function __construct(
        public SupportBrand $brand,
    ) {}

    public function handle(AvailabilitySchedule $schedule): void
    {
        $brand = $this->brand->fresh();

        if ($brand === null || ! $brand->enabled || ! $brand->isConfigured()) {
            return;
        }

        $rules = $schedule->rules()->toArray();
        $body = json_encode($rules, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $timestamp = (string) now()->getTimestamp();

        try {
            $response = Http::timeout(10)
                ->acceptJson()
                ->withHeaders([
                    'X-Availability-Timestamp' => $timestamp,
                    'X-Availability-Signature' => 'sha256='.hash_hmac('sha256', "{$timestamp}.{$body}", (string) $brand->secret),
                ])
                ->withBody($body, 'application/json')
                ->post($brand->pushUrl());
        } catch (ConnectionException $exception) {
            $brand->recordPush(PushStatus::Error, $rules['version'], PushError::ConnectionFailed);

            throw $exception;
        }

        if ($response->serverError()) {
            $brand->recordPush(PushStatus::Error, $rules['version'], PushError::ServerError, $response->status());

            throw new RequestException($response);
        }

        if ($response->failed()) {
            $brand->recordPush(PushStatus::Error, $rules['version'], PushError::Rejected, $response->status());

            $this->fail(new RuntimeException("{$brand->name} rejected the availability push with HTTP {$response->status()}."));

            return;
        }

        $status = PushStatus::tryFrom((string) $response->json('status'));

        if ($status === null || $status === PushStatus::Error) {
            $brand->recordPush(PushStatus::Error, $rules['version'], PushError::UnexpectedResponse, $response->status());

            return;
        }

        $brand->recordPush(
            $status,
            $rules['version'],
            reportedMode: Mode::tryFrom((string) $response->json('mode')),
        );
    }
}
