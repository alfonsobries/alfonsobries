<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\FavoriteIllustration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The family's collection of kept illustrations. Favoriting copies the image
 * out of the chat message, so the collection survives deleted conversations.
 */
class FavoriteIllustrationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $favorites = FavoriteIllustration::query()
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->get()
            ->map(fn (FavoriteIllustration $favorite): array => $favorite->toApiPayload())
            ->values();

        return response()->json(['data' => $favorites]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'chat_message_id' => ['required', 'integer', 'exists:chat_messages,id'],
        ]);

        $message = ChatMessage::with('conversation')->findOrFail($validated['chat_message_id']);

        if (! $message->conversation->isOwnedBy($request->user())) {
            return response()->json(['message' => 'This conversation belongs to someone else.'], 403);
        }

        $media = $message->getFirstMedia('attachments');

        if ($media === null) {
            return response()->json(['message' => 'This message has no illustration to keep.'], 422);
        }

        $existing = FavoriteIllustration::query()
            ->where('user_id', $request->user()->id)
            ->where('chat_message_id', $message->id)
            ->first();

        if ($existing !== null) {
            return response()->json(['data' => $existing->toApiPayload()]);
        }

        $favorite = FavoriteIllustration::create([
            'user_id' => $request->user()->id,
            'chat_message_id' => $message->id,
            'prompt' => $this->promptFor($message),
            'members' => $message->conversation->members,
        ]);

        $media->copy($favorite, 'image');

        return response()->json(['data' => $favorite->fresh()->toApiPayload()], 201);
    }

    public function destroy(Request $request, FavoriteIllustration $favoriteIllustration): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if ($favoriteIllustration->user_id !== $request->user()->id) {
            return response()->json(['message' => 'This favorite belongs to someone else.'], 403);
        }

        $favoriteIllustration->delete();

        return response()->json(['data' => null]);
    }

    /**
     * The user message that asked for this illustration, for the gallery.
     */
    private function promptFor(ChatMessage $message): ?string
    {
        return $message->conversation->messages()
            ->where('role', ChatMessage::ROLE_USER)
            ->where('id', '<', $message->id)
            ->latest('id')
            ->value('content');
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can keep illustrations.'], 403);
        }

        return null;
    }
}
