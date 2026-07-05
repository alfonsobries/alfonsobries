<?php

namespace App\Http\Controllers;

use App\Models\Assistant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    /**
     * The chat "mini apps" available to the signed-in family member.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $assistants = Assistant::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->filter(fn (Assistant $assistant): bool => $assistant->isVisibleTo($request->user()->family_member))
            ->map(fn (Assistant $assistant): array => $assistant->toApiPayload())
            ->values();

        return response()->json(['data' => $assistants]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can use the chat.'], 403);
        }

        return null;
    }
}
