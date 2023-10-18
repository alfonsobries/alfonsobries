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
    'node_binary' => env('NODE_BINARY', '/usr/local/bin/node'),
    'npm_binary' => env('NPM_BINARY', '/usr/local/bin/npm'),
];
