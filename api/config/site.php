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
    // Known people who use the app, keyed by their Apple sub. Lets the code tell
    // one signed-in family member from another. Shape: [{key, name, apple_id}].
    'family' => json_decode(env('FAMILY_MEMBERS') ?: '[]', true) ?: [],
    'node_binary' => env('NODE_BINARY', '/usr/local/bin/node'),
    'npm_binary' => env('NPM_BINARY', '/usr/local/bin/npm'),
];
