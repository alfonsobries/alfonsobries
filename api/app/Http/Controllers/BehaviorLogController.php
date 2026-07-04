<?php

namespace App\Http\Controllers;

use App\Models\Behavior;
use App\Models\BehaviorLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BehaviorLogController extends Controller
{
    /**
     * The behavior feed, newest first — everything the family logged, or one
     * kid's history when `member` is given.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'member' => ['sometimes', Rule::in(User::KID_MEMBERS)],
        ]);

        $logs = BehaviorLog::with(['behavior', 'user'])
            ->when($validated['member'] ?? null, fn ($query, string $member) => $query->where('family_member', $member))
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (BehaviorLog $log): array => $this->present($log))
            ->values();

        return response()->json(['data' => $logs]);
    }

    /**
     * Log that a behavior happened. When it hit the logging parent's mood,
     * the mood drops by the behavior's points.
     */
    public function store(Request $request, Behavior $behavior): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'affected_mood' => ['required', 'boolean'],
            'mood_emoji' => ['nullable', 'string', 'max:16'],
        ]);

        $user = $request->user();

        $log = BehaviorLog::create([
            'behavior_id' => $behavior->id,
            'family_member' => $behavior->family_member,
            'user_id' => $user->id,
            'points' => $behavior->points,
            'affected_mood' => $validated['affected_mood'],
            'mood_emoji' => $validated['affected_mood'] ? ($validated['mood_emoji'] ?? null) : null,
        ]);

        if ($log->affected_mood && $user->hasMood()) {
            $user->mood = max(User::MOOD_MIN, $user->mood - $log->points);
            $user->save();
        }

        return response()->json(['data' => $this->present($log->load(['behavior', 'user']))], 201);
    }

    /**
     * Undo a log (an accidental tap). If it had lowered the logger's mood,
     * the points are given back.
     */
    public function destroy(Request $request, BehaviorLog $behaviorLog): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $logger = $behaviorLog->user;

        if ($behaviorLog->affected_mood && $logger !== null && $logger->hasMood()) {
            $logger->mood = min(User::MOOD_MAX, $logger->mood + $behaviorLog->points);
            $logger->save();
        }

        $behaviorLog->delete();

        return response()->json(['data' => null]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can use the behavior log.'], 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function present(BehaviorLog $log): array
    {
        return [
            'id' => $log->id,
            'family_member' => $log->family_member,
            'behavior' => [
                'id' => $log->behavior->id,
                'name' => $log->behavior->name,
                'image_url' => $log->behavior->imageUrl(),
            ],
            'points' => $log->points,
            'affected_mood' => $log->affected_mood,
            'mood_emoji' => $log->mood_emoji,
            'logged_by' => [
                'family_member' => $log->user?->family_member,
                'name' => $log->user?->name,
            ],
            'created_at' => $log->created_at?->toIso8601String(),
        ];
    }
}
