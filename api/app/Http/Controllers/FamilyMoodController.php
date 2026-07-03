<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyMoodController extends Controller
{
    /**
     * The current mood of the family members who have one — the parents — so
     * the app can show how everyone is doing at a glance.
     */
    public function index(): JsonResponse
    {
        $moods = User::whereIn('family_member', User::MOOD_MEMBERS)
            ->orderBy('id')
            ->get()
            ->map(fn (User $user): array => $this->present($user))
            ->values();

        return response()->json(['data' => $moods]);
    }

    /**
     * Update a family member's mood. Any family member may set any member's
     * mood (the app gates this behind Face ID on the device).
     */
    public function update(Request $request, string $member): JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can set a mood.'], 403);
        }

        $validated = $request->validate([
            'mood' => ['required', 'integer', 'between:'.User::MOOD_MIN.','.User::MOOD_MAX],
        ]);

        $target = User::where('family_member', $member)->first();

        if (! $target || ! $target->hasMood()) {
            return response()->json(['message' => 'Unknown family member.'], 404);
        }

        $target->mood = $validated['mood'];
        $target->save();

        return response()->json(['data' => $this->present($target)]);
    }

    /**
     * @return array{family_member: string|null, name: string|null, mood: int}
     */
    private function present(User $user): array
    {
        return [
            'family_member' => $user->family_member,
            'name' => $user->name,
            'mood' => $user->mood,
        ];
    }
}
