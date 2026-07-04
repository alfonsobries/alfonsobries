<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateBehaviorIllustration;
use App\Models\BehaviorIllustration;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class BehaviorIllustrationController extends Controller
{
    /**
     * Kick off an AI illustration for a behavior name. The app polls `show`
     * until the status settles.
     */
    public function store(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'family_member' => ['required', Rule::in(User::KID_MEMBERS)],
        ]);

        $illustration = BehaviorIllustration::create([
            'user_id' => $request->user()->id,
            'family_member' => $validated['family_member'],
            'name' => $validated['name'],
        ]);

        try {
            GenerateBehaviorIllustration::dispatch($illustration);
        } catch (Throwable $exception) {
            // On the sync queue the job's failed() hook already marked the
            // row; this keeps the request itself from turning into a 500.
            report($exception);
        }

        return response()->json(['data' => $this->present($illustration->fresh())], 201);
    }

    public function show(Request $request, BehaviorIllustration $behaviorIllustration): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        return response()->json(['data' => $this->present($behaviorIllustration)]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can generate illustrations.'], 403);
        }

        return null;
    }

    /**
     * @return array{id: int, name: string, status: string, path: string|null, url: string|null, error: string|null}
     */
    private function present(BehaviorIllustration $illustration): array
    {
        return $illustration->toApiPayload();
    }
}
