<?php

namespace App\Http\Controllers;

use App\Models\DeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use NotificationChannels\Expo\ExpoPushToken;

class PushTokenController extends Controller
{
    /**
     * Register (or refresh) the Expo push token for the signed-in user's device.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', ExpoPushToken::rule()],
            'platform' => ['nullable', 'string', 'max:20'],
        ]);

        $device = DeviceToken::updateOrCreate(
            ['expo_token' => $validated['token']],
            [
                'user_id' => $request->user()->id,
                'platform' => $validated['platform'] ?? null,
                'last_used_at' => now(),
            ],
        );

        return response()->json([
            'data' => ['expo_token' => (string) $device->expo_token],
        ], 201);
    }
}
