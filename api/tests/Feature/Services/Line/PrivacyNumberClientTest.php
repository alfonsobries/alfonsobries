<?php

use App\Services\Line\PrivacyNumberClient;
use App\Services\Line\PrivacyNumberException;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    configurePrivacyNumber();
    Http::preventStrayRequests();
});

it('sends the pinned version and idempotency headers', function () {
    Http::fake([
        'https://api.privacynumber.io/v1/sms' => Http::response([
            'id' => 'sms_1',
            'segments' => 1,
        ]),
    ]);

    $sent = app(PrivacyNumberClient::class)->sendSms(
        from: 'num_1',
        to: '+525511110000',
        body: 'hola',
        scheduledAt: null,
        idempotencyKey: 'idem-1',
    );

    expect($sent['id'])->toBe('sms_1');

    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.privacynumber.io/v1/sms'
        && $request->hasHeader('Authorization', 'Bearer sk_test_key')
        && $request->hasHeader('PrivacyNumber-Version', PrivacyNumberClient::VERSION)
        && $request->hasHeader('Idempotency-Key', 'idem-1'));
});

it('maps the provider error envelope', function () {
    Http::fake([
        'https://api.privacynumber.io/v1/sms' => Http::response([
            'error' => [
                'type' => 'invalid_request_error',
                'code' => 'parameter_missing',
                'message' => 'to is required',
                'param' => 'to',
                'request_id' => 'req_1',
            ],
        ], 400),
    ]);

    try {
        app(PrivacyNumberClient::class)->sendSms('num_1', '+525511110000', 'hola', null, 'idem-2');
        $this->fail('Expected PrivacyNumberException');
    } catch (PrivacyNumberException $exception) {
        expect($exception->errorCode)->toBe('parameter_missing')
            ->and($exception->param)->toBe('to')
            ->and($exception->requestId)->toBe('req_1')
            ->and($exception->status)->toBe(400);
    }

    Http::assertSentCount(1);
});

it('retries a 429 then succeeds', function () {
    Http::fake([
        'https://api.privacynumber.io/v1/account' => Http::sequence()
            ->push(['error' => ['message' => 'slow down']], 429)
            ->push(['id' => 'acc_1'], 200),
    ]);

    expect(app(PrivacyNumberClient::class)->account()['id'])->toBe('acc_1');
});
