<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'vercel' => [
        'deployment_url' => env('VERCEL_DEPLOYMENT_URL'),
    ],

    'telegram-bot-api' => [
        'token' => env('TELEGRAM_BOT_TOKEN'),
        'chat_id' => env('TELEGRAM_CHAT_ID'),
    ],

    // The home assistant's own bot (separate from the notifications one above):
    // people text it expenses and it answers through the same home chat.
    'telegram-home' => [
        'token' => env('TELEGRAM_HOME_BOT_TOKEN'),
        // Sent back by Telegram on every webhook call; set by telegram:home-webhook.
        'webhook_secret' => env('TELEGRAM_HOME_WEBHOOK_SECRET'),
    ],

    'eas' => [
        // Shared secret that signs the OTA-published webhook (see OtaUpdateController).
        'notify_secret' => env('EAS_NOTIFY_SECRET'),
    ],

    'privacynumber' => [
        'key' => env('PRIVACYNUMBER_API_KEY'),
        // Signing secret of the webhook endpoint registered with the provider
        // (returned by POST /v1/webhook_endpoints; see LineWebhookController).
        'webhook_secret' => env('PRIVACYNUMBER_WEBHOOK_SECRET'),
        'base_url' => env('PRIVACYNUMBER_BASE_URL', 'https://api.privacynumber.io/v1'),
        'panel_url' => env('PRIVACYNUMBER_PANEL_URL', 'https://privacynumber.io/'),
    ],

    'apple' => [
        // The iOS bundle identifier, used as the expected `aud` of the identity
        // tokens issued by expo-apple-authentication.
        'client_id' => env('APPLE_CLIENT_ID', 'com.alfonsobries.app'),
        // Optional Services ID for a future web/Android sign-in flow.
        'services_id' => env('APPLE_SERVICES_ID'),
    ],

];
