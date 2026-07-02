<?php

namespace App\Services\Apple;

class AppleVerifiedUser
{
    public function __construct(
        public readonly string $id,
        public readonly ?string $email,
        public readonly bool $emailIsPrivateRelay,
    ) {}
}
