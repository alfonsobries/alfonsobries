<?php

namespace App\Http\Controllers;

use App\Models\LineCall;
use App\Models\LineContact;
use App\Models\LineMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LineThreadController extends Controller
{
    private const PAGE_SIZE = 50;

    /**
     * The conversation list: every contact with message or call history,
     * newest activity first, each with its latest message and unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['sometimes', 'string', 'max:200'],
        ]);

        $search = isset($validated['q']) ? trim($validated['q']) : '';

        $contacts = LineContact::query()
            ->where(function ($query): void {
                $query->whereHas('messages')->orWhereHas('calls');
            })
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $like = '%'.$search.'%';
                    $inner->where('e164', 'like', $like)
                        ->orWhere('name', 'like', $like)
                        ->orWhereHas('messages', fn ($messages) => $messages->where('body', 'like', $like));
                });
            })
            ->withMax('messages as last_message_at', 'provider_created_at')
            ->withMax('calls as last_call_at', 'started_at')
            ->withCount([
                'messages as unread_count' => fn ($query) => $query
                    ->where('direction', LineMessage::DIRECTION_IN)
                    ->whereNull('read_at'),
            ])
            ->get()
            ->sortByDesc(fn (LineContact $contact): string => max(
                (string) $contact->getAttribute('last_message_at'),
                (string) $contact->getAttribute('last_call_at'),
            ))
            ->values();

        $latestIds = LineMessage::query()
            ->selectRaw('MAX(id) as id')
            ->whereIn('line_contact_id', $contacts->pluck('id'))
            ->groupBy('line_contact_id')
            ->pluck('id');

        $latest = LineMessage::whereIn('id', $latestIds)->get()->keyBy('line_contact_id');

        $latestCalls = LineCall::query()
            ->whereIn('id', LineCall::query()
                ->selectRaw('MAX(id) as id')
                ->whereIn('line_contact_id', $contacts->pluck('id'))
                ->groupBy('line_contact_id')
                ->pluck('id'))
            ->get()
            ->keyBy('line_contact_id');

        $threads = $contacts->map(fn (LineContact $contact): array => [
            ...$contact->toApiPayload(),
            'unread_count' => (int) $contact->getAttribute('unread_count'),
            'last_message' => $latest->get($contact->id)?->toApiPayload(),
            'last_call' => $latestCalls->get($contact->id)?->toApiPayload(),
        ]);

        return response()->json(['data' => $threads]);
    }

    /**
     * One thread, newest page first; opening it marks the inbound messages
     * as read. Pass `before` (a message id) to load older pages.
     */
    public function show(Request $request, LineContact $lineContact): JsonResponse
    {
        $validated = $request->validate([
            'before' => ['sometimes', 'integer'],
        ]);

        $page = $lineContact->messages()
            ->when(isset($validated['before']), fn ($query) => $query->where('id', '<', $validated['before']))
            ->orderByDesc('id')
            ->limit(self::PAGE_SIZE + 1)
            ->get();

        $hasMore = $page->count() > self::PAGE_SIZE;
        $messages = $page->take(self::PAGE_SIZE);

        $lineContact->messages()
            ->where('direction', LineMessage::DIRECTION_IN)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['data' => [
            'contact' => $lineContact->toApiPayload(),
            'messages' => $messages->map(fn (LineMessage $message): array => $message->toApiPayload())->values(),
            'has_more' => $hasMore,
        ]]);
    }
}
