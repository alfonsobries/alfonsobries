<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'message' => __('Welcome to Alfonso\'s App'),
            'status' => 'online',
            'environment' => app()->environment(),
            'version' => config('app.version', '1.0.0'),
            'server_time' => now()->toIso8601String(),
        ]);
    }
}
