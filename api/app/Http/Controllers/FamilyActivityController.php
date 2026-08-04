<?php

namespace App\Http\Controllers;

use App\Models\BehaviorIllustration;
use App\Models\FamilyActivity;
use App\Models\PhoneReport;
use App\Services\FamilyTimeBank;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyActivityController extends Controller
{
    public function __construct(
        private readonly FamilyTimeBank $bank,
    ) {}

    /**
     * What the family can cash their minutes in on, cheapest first, with the
     * bank's balance and how long they have gone without a report.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $activities = FamilyActivity::orderBy('cost_minutes')
            ->orderBy('id')
            ->get()
            ->map(fn (FamilyActivity $activity): array => $this->present($activity))
            ->values();

        return response()->json([
            'data' => $activities,
            'minutes' => $this->bank->balance(),
            'clean_days' => $this->cleanDays(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:60'],
            'cost_minutes' => ['required', 'integer', 'between:5,600'],
            'image_path' => ['nullable', 'string', 'starts_with:temp/'],
        ]);

        $activity = FamilyActivity::create($validated);

        $this->attachImage($activity, $validated['image_path'] ?? null);

        return response()->json(['data' => $this->present($activity)], 201);
    }

    public function update(Request $request, FamilyActivity $familyActivity): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:60'],
            'cost_minutes' => ['sometimes', 'required', 'integer', 'between:5,600'],
            'image_path' => ['nullable', 'string', 'starts_with:temp/'],
        ]);

        $familyActivity->update($validated);

        $this->attachImage($familyActivity, $validated['image_path'] ?? null);

        return response()->json(['data' => $this->present($familyActivity)]);
    }

    public function destroy(Request $request, FamilyActivity $familyActivity): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $familyActivity->delete();

        return response()->json(['data' => null]);
    }

    /**
     * Cash the minutes in — the family is doing this together now.
     */
    public function redeem(Request $request, FamilyActivity $familyActivity): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        if ($this->bank->balance() < $familyActivity->cost_minutes) {
            return response()->json(['message' => 'Not enough minutes saved up yet.'], 422);
        }

        $this->bank->spend($familyActivity, $request->user());

        return response()->json([
            'data' => $this->present($familyActivity),
            'minutes' => $this->bank->balance(),
        ]);
    }

    /**
     * Days in a row up to today with nothing confirmed — the streak worth
     * keeping.
     */
    private function cleanDays(): int
    {
        $last = PhoneReport::where('status', PhoneReport::STATUS_CONFIRMED)
            ->latest('date')
            ->value('date');

        if ($last === null) {
            return 0;
        }

        return (int) $last->startOfDay()->diffInDays(now()->startOfDay());
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can use family time.'], 403);
        }

        return null;
    }

    private function attachImage(FamilyActivity $activity, ?string $path): void
    {
        if ($path === null) {
            return;
        }

        $activity
            ->addMediaFromDisk($path, BehaviorIllustration::DISK)
            ->toMediaCollection('illustration');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(FamilyActivity $activity): array
    {
        return [
            'id' => $activity->id,
            'name' => $activity->name,
            'cost_minutes' => $activity->cost_minutes,
            'image_url' => $activity->imageUrl(),
        ];
    }
}
