<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyMoodController extends Controller
{
    /**
     * The current mood of every family member, so the app can show how
     * everyone is doing at a glance.
     */
    public function index(): JsonResponse
    {
        $moods = User::family()
            ->orderBy('id')
            ->get()
            ->map(fn (User $user): array => $this->present($user))
            ->values();

        return response()->json(['data' => $moods]);
    }

    /**
     * Update the signed-in person's own mood.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isFamilyMember()) {
            return response()->json(['message' => 'Only family members have a mood.'], 403);
        }

        $validated = $request->validate([
            'mood' => ['required', 'integer', 'between:'.User::MOOD_MIN.','.User::MOOD_MAX],
        ]);

        $user->mood = $validated['mood'];
        $user->save();

        return response()->json(['data' => $this->present($user)]);
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
