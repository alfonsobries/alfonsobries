<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Services\ChatMessenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatMessageController extends Controller
{
    /**
     * Append a message to a conversation and queue the assistant's reply.
     * The reply arrives over the conversation's private channel; `show`
     * doubles as a polling fallback.
     */
    public function store(Request $request, Conversation $conversation, ChatMessenger $messenger): JsonResponse
    {
        if ($response = $this->guard($request, $conversation)) {
            return $response;
        }

        $validated = $request->validate([
            'content' => ['nullable', 'string', 'max:8000', 'required_without:image_paths'],
            'image_paths' => ['nullable', 'array', 'max:4'],
            'image_paths.*' => ['string', 'starts_with:temp/'],
        ]);

        [$userMessage, $reply] = $messenger->send(
            $conversation,
            $validated['content'] ?? null,
            $validated['image_paths'] ?? [],
        );

        return response()->json([
            'data' => [
                'user_message' => $userMessage->toApiPayload(),
                'reply' => $reply->toApiPayload(),
            ],
        ], 201);
    }

    public function show(Request $request, ChatMessage $chatMessage): JsonResponse
    {
        if ($response = $this->guard($request, $chatMessage->conversation)) {
            return $response;
        }

        return response()->json(['data' => $chatMessage->toApiPayload()]);
    }

    private function guard(Request $request, Conversation $conversation): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can use the chat.'], 403);
        }

        if (! $conversation->isOwnedBy($request->user())) {
            return response()->json(['message' => 'This conversation belongs to someone else.'], 403);
        }

        return null;
    }
}
