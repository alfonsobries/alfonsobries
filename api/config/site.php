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
    // Defaults for chat assistants; an Assistant record can override both,
    // and the runtime-selected model (App\AI\ModelCatalog) wins otherwise.
    'chat' => [
        'provider' => env('AI_CHAT_PROVIDER', 'openai'),
        'model' => env('AI_CHAT_MODEL', 'gpt-5.1'),
        'default_model' => env('AI_CHAT_DEFAULT_MODEL', 'gpt-5-1'),
        /*
         * The chat models selectable from the app settings (Alfonso only) —
         * only the relevant ones, not every model that exists. `price` is a
         * rough blended USD per million tokens and only drives the ordering;
         * `cost` and `blurb` are the human-readable comparison.
         */
        'models' => [
            'gpt-5-mini' => [
                'provider' => 'openai',
                'model' => 'gpt-5-mini',
                'label' => 'GPT-5 mini',
                'price' => 1,
                'cost' => '$',
                'blurb' => 'Cheapest and fast — plenty for translations and everyday questions.',
                'recommended' => true,
            ],
            'claude-haiku-4-5' => [
                'provider' => 'anthropic',
                'model' => 'claude-haiku-4-5',
                'label' => 'Claude Haiku 4.5',
                'price' => 2,
                'cost' => '$',
                'blurb' => 'Claude\'s quick model — cheap, fast, nice writing.',
                'recommended' => false,
            ],
            'gpt-5-1' => [
                'provider' => 'openai',
                'model' => 'gpt-5.1',
                'label' => 'GPT-5.1',
                'price' => 6,
                'cost' => '$$',
                'blurb' => 'The current default — smarter, a bit slower and pricier.',
                'recommended' => false,
            ],
            'claude-sonnet-5' => [
                'provider' => 'anthropic',
                'model' => 'claude-sonnet-5',
                'label' => 'Claude Sonnet 5',
                'price' => 12,
                'cost' => '$$$',
                'blurb' => 'Best writing quality, priciest — rarely needed here.',
                'recommended' => false,
            ],
        ],
    ],
    'node_binary' => env('NODE_BINARY', '/usr/local/bin/node'),
    'npm_binary' => env('NPM_BINARY', '/usr/local/bin/npm'),
];
