<?php

namespace App\Jobs;

use App\Events\LineCallUpdated;
use App\Events\LineVoicemailUpdated;
use App\Models\LineCall;
use App\Models\LineVoicemail;
use App\Services\Line\PrivacyNumberClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

/**
 * Copies a voicemail or call recording from the provider to our own S3
 * bucket. The provider's pre-signed URLs expire after one hour, so this
 * runs as soon as the audio exists — afterwards the app only ever streams
 * from our bucket.
 */
class ArchiveLineAudio implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public int $timeout = 180;

    public function __construct(
        public LineVoicemail|LineCall $target,
    ) {}

    public function handle(PrivacyNumberClient $client): void
    {
        $url = $this->audioUrl($client);

        if ($url === null) {
            return;
        }

        $audio = Http::timeout(120)->get($url);

        if ($audio->failed()) {
            throw new RuntimeException("Line audio download failed with status {$audio->status()}.");
        }

        $extension = $this->extensionFor((string) $audio->header('Content-Type'));

        if ($this->target instanceof LineVoicemail) {
            $path = "line/voicemails/{$this->target->id}.{$extension}";
            Storage::disk('s3')->put($path, $audio->body());

            $this->target->update(['audio_path' => $path]);
            LineVoicemailUpdated::dispatch($this->target);

            return;
        }

        $path = "line/recordings/{$this->target->id}.{$extension}";
        Storage::disk('s3')->put($path, $audio->body());

        $this->target->update(['recording_path' => $path]);
        LineCallUpdated::dispatch($this->target);
    }

    private function audioUrl(PrivacyNumberClient $client): ?string
    {
        if ($this->target instanceof LineVoicemail) {
            $fresh = $client->voicemail($this->target->provider_id);

            return $fresh['audio_url'] ?? $fresh['url'] ?? $fresh['recording_url'] ?? null;
        }

        $fresh = $client->call($this->target->provider_id);

        return $fresh['recording_url'] ?? null;
    }

    private function extensionFor(string $contentType): string
    {
        return match (true) {
            str_contains($contentType, 'wav') => 'wav',
            str_contains($contentType, 'ogg') => 'ogg',
            str_contains($contentType, 'mp4'), str_contains($contentType, 'm4a') => 'm4a',
            default => 'mp3',
        };
    }

    public function failed(?Throwable $exception): void
    {
        report($exception ?? new RuntimeException('Line audio archival failed.'));
    }
}
