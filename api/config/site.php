<?php

return [
    'site_url' => env('FRONT_URL', 'https://www.alfonsobries.com'),
    'secret_prefix' => env('SECRET_PREFIX', false),
    'expireCacheKey' => 'frontend-expired',
    'expireResumeKey' => 'resume-expired',
    'admin' => [
        'name' => env('ADMIN_NAME'),
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD'),
    ],
    // Apple subs of the two people who use the app, so the code can tell them
    // apart once signed in. Empty in public/dev environments.
    'family' => [
        'alfonso_apple_id' => env('ALFONSO_APPLE_ID'),
        'saida_apple_id' => env('SAIDA_APPLE_ID'),
    ],
    'node_binary' => env('NODE_BINARY', '/usr/local/bin/node'),
    'npm_binary' => env('NPM_BINARY', '/usr/local/bin/npm'),
];
