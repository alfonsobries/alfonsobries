<?php

namespace App\Http\Controllers;

use App\Models\LineVoicemail;
use App\Services\Line\PrivacyNumberClient;
use App\Services\Line\PrivacyNumberException;
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

    public function destroy(LineVoicemail $lineVoicemail, PrivacyNumberClient $client): JsonResponse
    {
        try {
            $client->deleteVoicemail($lineVoicemail->provider_id);
        } catch (PrivacyNumberException $exception) {
            report($exception);
        }

        if ($lineVoicemail->audio_path !== null) {
            Storage::disk('s3')->delete($lineVoicemail->audio_path);
        }

        $lineVoicemail->delete();

        return response()->json(['data' => null]);
    }
}
