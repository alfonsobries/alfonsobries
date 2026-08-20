<?php

namespace App\Console\Commands;

use App\Services\Line\PrivacyNumberClient;
use Illuminate\Console\Command;

class RegisterLineWebhook extends Command
{
    protected $signature = 'line:register-webhook {url : HTTPS URL the provider will POST to}';

    protected $description = 'Register the private-line webhook endpoint with the provider and print the signing secret once';

    public function handle(PrivacyNumberClient $client): int
    {
        $url = (string) $this->argument('url');

        $endpoint = $client->createWebhookEndpoint($url);

        $secret = $endpoint['secret'] ?? $endpoint['signing_secret'] ?? null;

        $this->info('Webhook registered: '.($endpoint['id'] ?? 'unknown id'));

        if (is_string($secret) && $secret !== '') {
            $this->warn('Signing secret (store as PRIVACYNUMBER_WEBHOOK_SECRET, shown once):');
            $this->line($secret);
        } else {
            $this->warn('The provider did not return a signing secret in this payload. Copy it from the panel.');
        }

        return self::SUCCESS;
    }
}
