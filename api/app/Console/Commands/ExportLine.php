<?php

namespace App\Console\Commands;

use App\Models\LineCall;
use App\Models\LineContact;
use App\Models\LineMessage;
use App\Models\LineVoicemail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ExportLine extends Command
{
    protected $signature = 'line:export';

    protected $description = 'Write a JSON snapshot of the private-line history to S3';

    public function handle(): int
    {
        $payload = [
            'exported_at' => now()->toIso8601String(),
            'contacts' => LineContact::query()->orderBy('id')->get()->map->toApiPayload()->values(),
            'messages' => LineMessage::query()->orderBy('id')->get()->map->toApiPayload()->values(),
            'calls' => LineCall::query()->with('contact')->orderBy('id')->get()->map->toApiPayload()->values(),
            'voicemails' => LineVoicemail::query()->with('contact')->orderBy('id')->get()->map->toApiPayload()->values(),
        ];

        $path = 'line/exports/'.now()->format('Y-m').'.json';
        Storage::disk('s3')->put($path, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->info("Wrote {$path}");

        return self::SUCCESS;
    }
}
