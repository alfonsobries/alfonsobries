<?php

namespace App\Http\Controllers;

use App\Models\BehaviorIllustration;
use App\Models\Chore;
use App\Models\ChoreLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ChoreController extends Controller
{
    /**
     * A kid's daily chores with today's check state, so the checklist renders
     * from a single call.
     */
    public function index(Request $request, string $member): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if (! in_array($member, User::KID_MEMBERS, true)) {
            return response()->json(['message' => 'Unknown kid.'], 404);
        }

        $todayLogs = ChoreLog::today()
            ->where('family_member', $member)
            ->get()
            ->keyBy('chore_id');

        $chores = Chore::where('family_member', $member)
            ->orderBy('id')
            ->get()
            ->map(fn (Chore $chore): array => $this->present($chore, $todayLogs->get($chore->id)))
            ->values();

        return response()->json(['data' => $chores]);
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

        $chore = Chore::create($validated);

        $this->attachImage($chore, $validated['image_path'] ?? null);

        return response()->json(['data' => $this->present($chore, null)], 201);
    }

    public function update(Request $request, Chore $chore): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:60'],
            'points' => ['sometimes', 'required', 'integer', 'between:1,9'],
            'image_path' => ['nullable', 'string', 'starts_with:temp/'],
        ]);

        $chore->update($validated);

        $this->attachImage($chore, $validated['image_path'] ?? null);

        $todayLog = ChoreLog::today()->where('chore_id', $chore->id)->first();

        return response()->json(['data' => $this->present($chore, $todayLog)]);
    }

    /**
     * Retire a chore. Soft-deleted so past days keep their history.
     */
    public function destroy(Request $request, Chore $chore): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $chore->delete();

        return response()->json(['data' => null]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can manage chores.'], 403);
        }

        return null;
    }

    private function attachImage(Chore $chore, ?string $path): void
    {
        if ($path === null) {
            return;
        }

        $chore
            ->addMediaFromDisk($path, BehaviorIllustration::DISK)
            ->toMediaCollection('illustration');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Chore $chore, ?ChoreLog $todayLog): array
    {
        return [
            'id' => $chore->id,
            'family_member' => $chore->family_member,
            'name' => $chore->name,
            'points' => $chore->points,
            'image_url' => $chore->imageUrl(),
            'today' => $todayLog === null ? null : [
                'log_id' => $todayLog->id,
                'status' => $todayLog->status,
            ],
        ];
    }
}
