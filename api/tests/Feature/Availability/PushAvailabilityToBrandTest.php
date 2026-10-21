<?php

use App\Availability\AvailabilitySchedule;
use App\Availability\Mode;
use App\Availability\PushStatus;
use App\Jobs\PushAvailabilityToBrand;
use App\Models\SupportAvailability;
use App\Models\SupportBrand;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::preventStrayRequests();
    $this->travelTo(now()->parse('2026-10-20 10:00:00', 'America/Mexico_City'));
    SupportAvailability::factory()->create(['version' => 9]);
    enableSupportBrands(['zebrasnap']);
    $this->brand = SupportBrand::query()->where('name', 'zebrasnap')->sole();
});

function pushToBrand(SupportBrand $brand): void
{
    (new PushAvailabilityToBrand($brand))->handle(app(AvailabilitySchedule::class));
}

it('records an applied push and the mode the brand reports', function () {
    Http::fake(['zebrasnap.test/*' => Http::response(['status' => 'applied', 'version' => 9, 'mode' => 'online'])]);

    pushToBrand($this->brand);

    $brand = $this->brand->fresh();

    expect($brand->last_push_status)->toBe(PushStatus::Applied)
        ->and($brand->last_pushed_version)->toBe(9)
        ->and($brand->reported_mode)->toBe(Mode::Online)
        ->and($brand->last_push_message)->toBeNull()
        ->and($brand->last_pushed_at?->toIso8601String())->toBe(now()->toIso8601String());

    Http::assertSent(fn (Request $request): bool => $request->hasHeader('Content-Type', 'application/json')
        && $request->header('X-Availability-Signature')[0] === 'sha256='.hash_hmac('sha256', now()->getTimestamp().'.'.$request->body(), 'secret-zebrasnap'));
});

it('records a stale answer without retrying', function () {
    Http::fake(['zebrasnap.test/*' => Http::response(['status' => 'stale'])]);

    pushToBrand($this->brand);

    expect($this->brand->fresh()->last_push_status)->toBe(PushStatus::Stale);
});

it('records a server error and throws so the queue retries', function () {
    Http::fake(['zebrasnap.test/*' => Http::response('Down', 503)]);

    expect(fn () => pushToBrand($this->brand))->toThrow(RequestException::class);

    $brand = $this->brand->fresh();

    expect($brand->last_push_status)->toBe(PushStatus::Error)
        ->and($brand->last_push_message)->toBe('Error del servidor (503).');
});

it('records a dropped connection and throws so the queue retries', function () {
    Http::fake(['zebrasnap.test/*' => fn () => throw new ConnectionException('timed out')]);

    expect(fn () => pushToBrand($this->brand))->toThrow(ConnectionException::class);

    expect($this->brand->fresh()->last_push_message)->toBe('No se pudo conectar.');
});

it('records a rejection without retrying', function () {
    Http::fake(['zebrasnap.test/*' => Http::response(['message' => 'Invalid signature.'], 401)]);

    pushToBrand($this->brand);

    $brand = $this->brand->fresh();

    expect($brand->last_push_status)->toBe(PushStatus::Error)
        ->and($brand->last_push_message)->toBe('Rechazado (401).');
});

it('records an unexpected answer', function () {
    Http::fake(['zebrasnap.test/*' => Http::response('<html>ok</html>')]);

    pushToBrand($this->brand);

    expect($this->brand->fresh()->last_push_status)->toBe(PushStatus::Error)
        ->and($this->brand->fresh()->last_push_message)->toBe('Respuesta inesperada.');
});

it('sends the rules as they are when it runs', function () {
    Http::fake(['zebrasnap.test/*' => Http::response(['status' => 'applied', 'version' => 10, 'mode' => 'bot'])]);

    $job = new PushAvailabilityToBrand($this->brand);
    SupportAvailability::current()->update(['version' => 10, 'outside_hours_mode' => Mode::Offline]);
    $job->handle(app(AvailabilitySchedule::class));

    Http::assertSent(fn (Request $request): bool => $request->data()['version'] === 10 && $request->data()['outside_hours_mode'] === 'offline');
});

it('does nothing for a brand that was disabled after it was queued', function () {
    Http::fake();

    $job = new PushAvailabilityToBrand($this->brand);
    $this->brand->update(['enabled' => false]);
    $job->handle(app(AvailabilitySchedule::class));

    Http::assertNothingSent();
});

it('retries three times with a growing backoff', function () {
    $job = new PushAvailabilityToBrand($this->brand);

    expect($job->tries)->toBe(3)
        ->and($job->backoff)->toBe([10, 60]);
});
