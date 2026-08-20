<?php

use App\Services\Line\OtpExtractor;

it('extracts verification codes', function (string $body, ?string $expected) {
    expect(OtpExtractor::extract($body))->toBe($expected);
})->with([
    'google prefix' => ['G-482917 is your Google verification code', '482917'],
    'spanish codigo' => ['Tu código de verificación es 123456', '123456'],
    'english code' => ['Your verification code is 918273', '918273'],
    'otp keyword' => ['OTP: 445566', '445566'],
    'split dashes' => ['Your code is 123-456', '123456'],
    'plain number without keyword' => ['See you at 8', null],
    'long tracking number ignored' => ['Tracking 123456789012', null],
]);
