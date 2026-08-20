<?php

namespace App\Http\Controllers;

use App\Models\LineVoicemail;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class LineVoicemailController extends Controller
{
    private const PAGE_SIZE = 100;

    public function index(): JsonResponse
    {
        $voicemails = LineVoicemail::with('contact')
            ->orderByDesc('received_at')
            ->limit(self::PAGE_SIZE)
            ->get();

        return response()->json([
            'data' => $voicemails->map(fn (LineVoicemail $voicemail): array => $voicemail->toApiPayload())->values(),
        ]);
    }

    /**
     * A short-lived URL to the archived audio in our own bucket — never the
     * provider's (theirs expired an hour after the voicemail landed).
     */
    public function audio(LineVoicemail $lineVoicemail): JsonResponse
    {
        if ($lineVoicemail->audio_path === null) {
            return response()->json(['message' => 'The audio is still being archived.'], 404);
        }

        return response()->json(['data' => [
            'url' => Storage::disk('s3')->temporaryUrl($lineVoicemail->audio_path, now()->addHour()),
        ]]);
    }

    public function heard(LineVoicemail $lineVoicemail): JsonResponse
    {
        if ($lineVoicemail->heard_at === null) {
            $lineVoicemail->update(['heard_at' => now()]);
        }

        return response()->json(['data' => $lineVoicemail->load('contact')->toApiPayload()]);
    }
}
