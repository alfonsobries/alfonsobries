<?php

return [
    'site_url' => env('FRONT_URL', 'https://www.alfonsobries.com'),
    'secret_prefix' => env('SECRET_PREFIX', false),
    'expireCacheKey' => 'frontend-expired',
    'expireResumeKey' => 'resume-expired',
    'admin' => [
        'name' => env('ADMIN_NAME'),
        'email' => env('ADMIN_EMAIL'),
        'passsword' => env('ADMIN_PASSWORD'),
    ],
];
