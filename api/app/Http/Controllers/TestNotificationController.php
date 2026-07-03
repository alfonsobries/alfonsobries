<?php

namespace App\Http\Controllers;

use App\Notifications\TestNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestNotificationController extends Controller
{
    /**
     * Send a test push notification to the signed-in user's devices.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->deviceTokens()->count() === 0) {
            return response()->json(['message' => 'No registered devices to notify.'], 422);
        }

        $user->notify(new TestNotification);

        return response()->json(['message' => 'Test notification sent.']);
    }
}
