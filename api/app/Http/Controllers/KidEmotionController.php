<?php

namespace App\Http\Controllers;

use App\Family\KidEmotion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KidEmotionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can read emotions.'], 403);
        }

        $emotions = User::whereIn('family_member', User::KID_MEMBERS)
            ->orderBy('id')
            ->get()
            ->map(fn (User $user): array => $this->present($user))
            ->values();

        return response()->json(['data' => $emotions]);
    }

    public function update(Request $request, string $member): JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can set an emotion.'], 403);
        }

        $target = User::where('family_member', $member)->first();

        if (! $target || ! in_array($target->family_member, User::KID_MEMBERS, true)) {
            return response()->json(['message' => 'Unknown child.'], 404);
        }

        $validated = $request->validate([
            'emotion' => ['required', 'string', Rule::enum(KidEmotion::class)],
        ]);

        $target->emotion = $validated['emotion'];
        $target->save();

        return response()->json(['data' => $this->present($target)]);
    }

    /**
     * @return array{family_member: string|null, name: string|null, emotion: string|null}
     */
    private function present(User $user): array
    {
        return [
            'family_member' => $user->family_member,
            'name' => $user->name,
            'emotion' => $user->emotion?->value,
        ];
    }
}
