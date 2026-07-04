<?php

namespace App\Http\Controllers;

use App\Models\Chore;
use App\Models\ChoreLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ChoreLogController extends Controller
{
    /**
     * Today's checks, optionally for one kid — what the evening review looks
     * at.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'member' => ['sometimes', Rule::in(User::KID_MEMBERS)],
        ]);

        $logs = ChoreLog::with('chore')
            ->today()
            ->when($validated['member'] ?? null, fn ($query, string $member) => $query->where('family_member', $member))
            ->orderBy('id')
            ->get()
            ->map(fn (ChoreLog $log): array => $this->present($log))
            ->values();

        return response()->json(['data' => $logs]);
    }

    /**
     * The kid marks a chore done for today. Idempotent: checking an already
     * checked chore returns the existing log.
     */
    public function store(Request $request, Chore $chore): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $log = ChoreLog::today()->where('chore_id', $chore->id)->first();

        $log ??= ChoreLog::create([
            'chore_id' => $chore->id,
            'family_member' => $chore->family_member,
            'date' => now()->toDateString(),
            'status' => ChoreLog::STATUS_DONE,
            'points' => $chore->points,
        ]);

        return response()->json(['data' => $this->present($log->load('chore'))], $log->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Uncheck an accidental tap — only while a parent hasn't reviewed it.
     */
    public function destroy(Request $request, ChoreLog $choreLog): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if ($choreLog->isReviewed()) {
            return response()->json(['message' => 'This check was already reviewed.'], 422);
        }

        $choreLog->delete();

        return response()->json(['data' => null]);
    }

    /**
     * The evening review: a parent approves or rejects the kid's check.
     * Approving earns the kid the points and lifts the reviewing parent's
     * mood by the same amount. Reviews can be re-run: changing the verdict
     * gives the previous reviewer's mood points back before applying the new
     * effect.
     */
    public function review(Request $request, ChoreLog $choreLog): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'approved' => ['required', 'boolean'],
        ]);

        $user = $request->user();
        $status = $validated['approved'] ? ChoreLog::STATUS_APPROVED : ChoreLog::STATUS_REJECTED;

        if ($status === $choreLog->status) {
            return response()->json(['data' => $this->present($choreLog->load('chore'))]);
        }

        if ($choreLog->status === ChoreLog::STATUS_APPROVED) {
            $previousReviewer = $choreLog->reviewer;

            if ($previousReviewer !== null && $previousReviewer->hasMood()) {
                $previousReviewer->mood = max(User::MOOD_MIN, $previousReviewer->mood - $choreLog->points);
                $previousReviewer->save();
            }
        }

        $choreLog->update([
            'status' => $status,
            'reviewed_by' => $user->id,
        ]);

        // The previous reviewer may be this same parent; re-read their mood.
        $user->refresh();

        if ($validated['approved'] && $user->hasMood()) {
            $user->mood = min(User::MOOD_MAX, $user->mood + $choreLog->points);
            $user->save();
        }

        return response()->json(['data' => $this->present($choreLog->load('chore'))]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can use chores.'], 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function present(ChoreLog $log): array
    {
        return [
            'id' => $log->id,
            'family_member' => $log->family_member,
            'chore' => [
                'id' => $log->chore->id,
                'name' => $log->chore->name,
                'image_url' => $log->chore->imageUrl(),
            ],
            'date' => $log->date->toDateString(),
            'status' => $log->status,
            'points' => $log->points,
        ];
    }
}
