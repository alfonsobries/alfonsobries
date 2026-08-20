<?php

namespace App\Http\Controllers;

use App\Models\LineCall;
use App\Models\LineMessage;
use App\Models\LineNumber;
use App\Models\LineVoicemail;
use App\Services\Line\LineSync;
use Illuminate\Http\JsonResponse;

class LineOverviewController extends Controller
{
    /**
     * Everything the line hub needs in one call: the number, and what's
     * waiting (unread messages, unseen missed calls, unheard voicemails).
     */
    public function __invoke(LineSync $sync): JsonResponse
    {
        $number = LineNumber::first() ?? $sync->syncNumber();

        return response()->json(['data' => [
            'number' => $number?->toApiPayload(),
            'unread_messages' => LineMessage::where('direction', LineMessage::DIRECTION_IN)
                ->whereNull('read_at')
                ->count(),
            'unseen_missed_calls' => LineCall::where('status', LineCall::STATUS_MISSED)
                ->whereNull('seen_at')
                ->count(),
            'unheard_voicemails' => LineVoicemail::whereNull('heard_at')->count(),
        ]]);
    }
}
