<?php

namespace App\Http\Controllers;

use App\Models\BehaviorIllustration;
use App\Models\Reward;
use App\Models\User;
use App\Services\KidPoints;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RewardController extends Controller
{
    public function __construct(
        private readonly KidPoints $points,
    ) {}

    /**
     * A kid's rewards — pending first, active goal at the top of those —
     * together with what each one has saved and what waits in the free jar.
     */
    public function index(Request $request, string $member): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if (! in_array($member, User::KID_MEMBERS, true)) {
            return response()->json(['message' => 'Unknown kid.'], 404);
        }

        $rewards = Reward::where('family_member', $member)
            ->orderByRaw('achieved_at is not null')
            ->orderByDesc('is_active')
            ->orderBy('id')
            ->get()
            ->map(fn (Reward $reward): array => $this->present($reward))
            ->values();

        return response()->json([
            'data' => $rewards,
            'balance' => $this->points->balanceFor($member),
            'free' => $this->points->freeFor($member),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'family_member' => ['required', Rule::in(User::KID_MEMBERS)],
            'name' => ['required', 'string', 'max:60'],
            'cost' => ['required', 'integer', 'between:1,999'],
            'available_on' => ['nullable', 'date'],
            'requires_content_parents' => ['sometimes', 'boolean'],
            'image_path' => ['nullable', 'string', 'starts_with:temp/'],
        ]);

        $reward = Reward::create($validated);

        $this->attachImage($reward, $validated['image_path'] ?? null);

        return response()->json(['data' => $this->present($reward->refresh())], 201);
    }

    public function update(Request $request, Reward $reward): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:60'],
            'cost' => ['sometimes', 'required', 'integer', 'between:1,999'],
            'available_on' => ['sometimes', 'nullable', 'date'],
            'requires_content_parents' => ['sometimes', 'boolean'],
            'image_path' => ['nullable', 'string', 'starts_with:temp/'],
        ]);

        $reward->update($validated);

        $this->attachImage($reward, $validated['image_path'] ?? null);

        return response()->json(['data' => $this->present($reward)]);
    }

    public function destroy(Request $request, Reward $reward): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $reward->delete();

        return response()->json(['data' => null]);
    }

    /**
     * Point the kid's saving at this goal. New points land here from now on,
     * and anything waiting in the free jar moves in.
     */
    public function activate(Request $request, Reward $reward): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if ($reward->isAchieved()) {
            return response()->json(['message' => 'This reward was already redeemed.'], 422);
        }

        $this->points->activate($reward);

        return response()->json(['data' => $this->present($reward->refresh())]);
    }

    /**
     * Cash the points in: the kid reached the goal and the parent hands the
     * reward over. The cost leaves this goal's jar; anything left over waits
     * for the next goal.
     */
    public function redeem(Request $request, Reward $reward): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if ($reward->isAchieved()) {
            return response()->json(['message' => 'This reward was already redeemed.'], 422);
        }

        if ($this->points->savedFor($reward) < $reward->cost) {
            return response()->json(['message' => 'Not enough points yet.'], 422);
        }

        if ($reward->available_on !== null && $reward->available_on->isFuture()) {
            return response()->json(['message' => 'This reward is not available yet.'], 422);
        }

        if ($reward->requires_content_parents && ! User::parentsAreContent()) {
            return response()->json(['message' => 'Mom and dad need to feel good first.'], 422);
        }

        $reward->update(['achieved_at' => now()]);

        $this->points->spend($reward);

        return response()->json([
            'data' => $this->present($reward->refresh()),
            'balance' => $this->points->balanceFor($reward->family_member),
        ]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can manage rewards.'], 403);
        }

        return null;
    }

    private function attachImage(Reward $reward, ?string $path): void
    {
        if ($path === null) {
            return;
        }

        $reward
            ->addMediaFromDisk($path, BehaviorIllustration::DISK)
            ->toMediaCollection('illustration');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Reward $reward): array
    {
        return [
            'id' => $reward->id,
            'family_member' => $reward->family_member,
            'name' => $reward->name,
            'cost' => $reward->cost,
            'saved' => max(0, $this->points->savedFor($reward)),
            'is_active' => $reward->is_active,
            'available_on' => $reward->available_on?->toDateString(),
            'requires_content_parents' => $reward->requires_content_parents,
            'parents_are_content' => User::parentsAreContent(),
            'image_url' => $reward->imageUrl(),
            'achieved_at' => $reward->achieved_at?->toIso8601String(),
        ];
    }
}
