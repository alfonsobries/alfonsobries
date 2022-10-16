<?php

return [
    'site_url' => env('FRONT_URL', 'http://localhost:3000'),
    'secret_prefix' => env('SECRET_PREFIX', false),
    'expireCacheKey' => 'frontend-expired',
];
