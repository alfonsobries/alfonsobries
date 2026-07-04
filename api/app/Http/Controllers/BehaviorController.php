<?php

namespace App\Http\Controllers;

use App\Models\Behavior;
use App\Models\BehaviorIllustration;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BehaviorController extends Controller
{
    /**
     * The behaviors a kid is currently working on, oldest first so the grid
     * keeps a stable, predictable order.
     */
    public function index(Request $request, string $member): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if (! in_array($member, User::KID_MEMBERS, true)) {
            return response()->json(['message' => 'Unknown kid.'], 404);
        }

        $behaviors = Behavior::where('family_member', $member)
            ->orderBy('id')
            ->get()
            ->map(fn (Behavior $behavior): array => $this->present($behavior))
            ->values();

        return response()->json(['data' => $behaviors]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'family_member' => ['required', Rule::in(User::KID_MEMBERS)],
            'name' => ['required', 'string', 'max:60'],
            'points' => ['required', 'integer', 'between:1,9'],
            'image_path' => ['nullable', 'string', 'starts_with:temp/'],
        ]);

        $behavior = Behavior::create($validated);

        $this->attachImage($behavior, $validated['image_path'] ?? null);

        return response()->json(['data' => $this->present($behavior)], 201);
    }

    public function update(Request $request, Behavior $behavior): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:60'],
            'points' => ['sometimes', 'required', 'integer', 'between:1,9'],
            'image_path' => ['nullable', 'string', 'starts_with:temp/'],
        ]);

        $behavior->update($validated);

        $this->attachImage($behavior, $validated['image_path'] ?? null);

        return response()->json(['data' => $this->present($behavior)]);
    }

    /**
     * Retire a behavior. Soft-deleted so past feed entries keep their name
     * and illustration.
     */
    public function destroy(Request $request, Behavior $behavior): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $behavior->delete();

        return response()->json(['data' => null]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can manage behaviors.'], 403);
        }

        return null;
    }

    /**
     * Attach an illustration waiting in temp storage — either AI-generated or
     * uploaded straight to S3 by the app.
     */
    private function attachImage(Behavior $behavior, ?string $path): void
    {
        if ($path === null) {
            return;
        }

        $behavior
            ->addMediaFromDisk($path, BehaviorIllustration::DISK)
            ->toMediaCollection('illustration');
    }

    /**
     * @return array{id: int, family_member: string, name: string, points: int, image_url: string|null}
     */
    private function present(Behavior $behavior): array
    {
        return [
            'id' => $behavior->id,
            'family_member' => $behavior->family_member,
            'name' => $behavior->name,
            'points' => $behavior->points,
            'image_url' => $behavior->imageUrl(),
        ];
    }
}
