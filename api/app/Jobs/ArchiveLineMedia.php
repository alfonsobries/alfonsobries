<?php

namespace App\Jobs;

use App\Events\LineMessageUpdated;
use App\Models\LineMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

/**
 * Copies inbound MMS attachments to our bucket so the thread still has
 * the images after the provider's URLs go stale.
 */
class ArchiveLineMedia implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public LineMessage $message,
    ) {}

    public function handle(): void
    {
        $urls = $this->message->media_urls ?? [];
        $paths = [];

        foreach ($urls as $index => $url) {
            if (! is_string($url) || $url === '') {
                continue;
            }

            $response = Http::timeout(60)->get($url);

            if ($response->failed()) {
                throw new RuntimeException("Line MMS download failed with status {$response->status()}.");
            }

            $extension = str_contains((string) $response->header('Content-Type'), 'png') ? 'png' : 'jpg';
            $path = "line/mms/{$this->message->id}/{$index}.{$extension}";
            Storage::disk('s3')->put($path, $response->body());
            $paths[] = $path;
        }

        if ($paths === []) {
            return;
        }

        $this->message->update(['media_paths' => $paths]);
        LineMessageUpdated::dispatch($this->message->loadMissing('contact'));
    }

    public function failed(?Throwable $exception): void
    {
        report($exception ?? new RuntimeException('Line MMS archival failed.'));
    }
}
