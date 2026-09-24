<?php

namespace App\Http\Controllers;

use App\Models\HomeMessage;
use App\Services\HomeMessenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class HomeMessageController extends Controller
{
    private const PAGE_SIZE = 40;

    /**
     * The person's home chat, newest first, a page at a time (`before` is the
     * oldest id already on screen).
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate([
            'before' => ['nullable', 'integer'],
        ]);

        $messages = $request->user()->homeMessages()
            ->with(['media', 'expenses.category', 'expenses.account'])
            ->when($validated['before'] ?? null, fn ($query, int $before) => $query->where('id', '<', $before))
            ->latest('id')
            ->limit(self::PAGE_SIZE + 1)
            ->get();

        return response()->json([
            'data' => $messages->take(self::PAGE_SIZE)->map(fn (HomeMessage $message): array => $message->toApiPayload())->values(),
            'has_more' => $messages->count() > self::PAGE_SIZE,
        ]);
    }

    public function store(Request $request, HomeMessenger $messenger): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate([
            'content' => ['nullable', 'string', 'max:4000'],
            'image_paths' => ['nullable', 'array', 'max:4'],
            'image_paths.*' => ['string', 'starts_with:temp/'],
            'audio_path' => ['nullable', 'string', 'starts_with:temp/'],
            'audio_duration' => ['nullable', 'integer', 'min:0', 'max:600000'],
            'client_key' => ['nullable', 'string', 'max:64'],
        ]);

        if (blank($validated['content'] ?? null) && empty($validated['image_paths']) && blank($validated['audio_path'] ?? null)) {
            throw ValidationException::withMessages(['content' => __('home.message_required')]);
        }

        [$message, $reply] = $messenger->send(
            $request->user(),
            $validated['content'] ?? null,
            $validated['image_paths'] ?? [],
            $validated['audio_path'] ?? null,
            $validated['audio_duration'] ?? null,
            HomeMessage::SOURCE_APP,
            $validated['client_key'] ?? null,
        );

        return response()->json([
            'data' => [
                'message' => $message->toApiPayload(),
                'reply' => $reply->toApiPayload(),
            ],
        ], 201);
    }

    /**
     * One message, for the app's polling fallback while a reply is pending.
     */
    public function show(Request $request, HomeMessage $homeMessage): JsonResponse
    {
        $this->authorize('useHome');

        abort_unless($homeMessage->user_id === $request->user()->id, 403);

        return response()->json(['data' => $homeMessage->toApiPayload()]);
    }
}
