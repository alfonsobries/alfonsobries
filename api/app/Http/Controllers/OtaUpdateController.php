<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\OtaUpdateNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OtaUpdateController extends Controller
{
    /**
     * Called by the publish script right after `eas update` succeeds. Public
     * route (the publisher has no session), authenticated by an HMAC-SHA256
     * signature of the raw body under a shared secret — same scheme as EAS's
     * own webhooks, and it works no matter where the publish runs.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $secret = (string) config('services.eas.notify_secret');
        $signature = (string) $request->header('X-Ota-Signature');

        if (
            $secret === ''
            || ! hash_equals(hash_hmac('sha256', $request->getContent(), $secret), $signature)
        ) {
            return response()->json(['message' => 'Invalid signature.'], 403);
        }

        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:200'],
            'channel' => ['nullable', 'string', 'max:50'],
        ]);

        $users = User::where('family_member', 'alfonso')
            ->whereHas('deviceTokens')
            ->get();

        foreach ($users as $user) {
            $user->notify(new OtaUpdateNotification(
                $validated['message'] ?? null,
                $validated['channel'] ?? null,
            ));
        }

        return response()->json(['message' => 'Notified.', 'devices' => $users->count()]);
    }
}
