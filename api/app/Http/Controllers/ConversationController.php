<?php

namespace App\Http\Controllers;

use App\Models\Assistant;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\User;
use App\Services\ChatMessenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ConversationController extends Controller
{
    /**
     * The user's recent conversations, newest activity first.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $conversations = Conversation::query()
            ->where('user_id', $request->user()->id)
            ->with(['assistant', 'messages' => fn ($query) => $query->latest('id')->limit(1)])
            ->latest('updated_at')
            ->limit(50)
            ->get()
            ->map(function (Conversation $conversation): array {
                /** @var ChatMessage|null $lastMessage */
                $lastMessage = $conversation->messages->first();

                return [
                    ...$conversation->toApiPayload(),
                    'last_message' => $lastMessage?->content === null
                        ? null
                        : Str::limit($lastMessage->content, 120),
                ];
            });

        return response()->json(['data' => $conversations]);
    }

    /**
     * Start a conversation with an assistant from its first message.
     */
    public function store(Request $request, ChatMessenger $messenger): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'assistant_id' => ['required', 'integer', 'exists:assistants,id'],
            'content' => ['nullable', 'string', 'max:8000', 'required_without:image_paths'],
            'image_paths' => ['nullable', 'array', 'max:4'],
            'image_paths.*' => ['string', 'starts_with:temp/'],
            'members' => ['nullable', 'array'],
            'members.*' => ['string', Rule::in([...User::MOOD_MEMBERS, ...User::KID_MEMBERS])],
        ]);

        $assistant = Assistant::findOrFail($validated['assistant_id']);

        if (! $assistant->isVisibleTo($request->user()->family_member)) {
            return response()->json(['message' => 'This assistant is not available to you.'], 403);
        }

        $conversation = Conversation::create([
            'user_id' => $request->user()->id,
            'assistant_id' => $assistant->id,
            'title' => Str::limit(trim($validated['content'] ?? ''), 60) ?: null,
            // Who stars in the drawings; only meaningful for the illustrator.
            'members' => $assistant->isIllustrator() ? array_values(array_unique($validated['members'] ?? [])) : null,
        ]);

        $messenger->send($conversation, $validated['content'] ?? null, $validated['image_paths'] ?? []);

        return response()->json(['data' => $this->present($conversation->fresh(['assistant', 'messages']))], 201);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        if ($response = $this->guard($request, $conversation)) {
            return $response;
        }

        return response()->json(['data' => $this->present($conversation->load(['assistant', 'messages']))]);
    }

    public function destroy(Request $request, Conversation $conversation): JsonResponse
    {
        if ($response = $this->guard($request, $conversation)) {
            return $response;
        }

        // Delete messages through Eloquent so their media files go with them.
        $conversation->messages->each->delete();
        $conversation->delete();

        return response()->json(['data' => null]);
    }

    private function guard(Request $request, ?Conversation $conversation = null): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can use the chat.'], 403);
        }

        if ($conversation !== null && ! $conversation->isOwnedBy($request->user())) {
            return response()->json(['message' => 'This conversation belongs to someone else.'], 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Conversation $conversation): array
    {
        return [
            ...$conversation->toApiPayload(),
            'messages' => $conversation->messages
                ->sortBy('id')
                ->map(fn (ChatMessage $message): array => $message->toApiPayload())
                ->values()
                ->all(),
        ];
    }
}
