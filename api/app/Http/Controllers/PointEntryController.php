<?php

namespace App\Http\Controllers;

use App\Models\ChoreLog;
use App\Models\PointEntry;
use App\Models\Reward;
use App\Models\User;
use App\Services\KidPoints;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PointEntryController extends Controller
{
    /**
     * How many movements the history returns — enough to answer "where did my
     * points come from?" without paging.
     */
    private const HISTORY_LIMIT = 50;

    public function __construct(
        private readonly KidPoints $points,
    ) {}

    /**
     * Where a kid's points came from, newest first. Carry-overs are left out:
     * they move points between goals without changing what the kid holds.
     */
    public function index(Request $request, string $member): JsonResponse
    {
        if ($response = $this->guard($request, $member)) {
            return $response;
        }

        $entries = PointEntry::with(['source', 'reward', 'author'])
            ->where('family_member', $member)
            ->where(fn ($query) => $query->whereNull('reason')->orWhere('reason', '!=', PointEntry::REASON_CARRY_OVER))
            ->latest('id')
            ->limit(self::HISTORY_LIMIT)
            ->get()
            ->map(fn (PointEntry $entry): array => $this->present($entry))
            ->values();

        return response()->json([
            'data' => $entries,
            'balance' => $this->points->balanceFor($member),
            'free' => $this->points->freeFor($member),
        ]);
    }

    /**
     * A parent hands out or takes back points by hand — a bonus for something
     * no chore covers, or a correction.
     */
    public function store(Request $request, string $member): JsonResponse
    {
        if ($response = $this->guard($request, $member)) {
            return $response;
        }

        $validated = $request->validate([
            'delta' => ['required', 'integer', 'between:-999,999', 'not_in:0'],
            'reason' => ['required', 'string', 'max:60'],
        ]);

        if ($this->points->balanceFor($member) + $validated['delta'] < 0) {
            return response()->json(['message' => 'That would leave them below zero.'], 422);
        }

        $entry = $this->points->adjust(
            $member,
            $validated['delta'],
            $validated['reason'],
            $request->user(),
        );

        return response()->json([
            'data' => $this->present($entry->load(['reward', 'author'])),
            'balance' => $this->points->balanceFor($member),
        ], 201);
    }

    private function guard(Request $request, string $member): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can use points.'], 403);
        }

        if (! in_array($member, User::KID_MEMBERS, true)) {
            return response()->json(['message' => 'Unknown kid.'], 404);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function present(PointEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'delta' => $entry->delta,
            'label' => $this->label($entry),
            'reward' => $entry->reward?->name,
            'author' => $entry->author?->name,
            'created_at' => $entry->created_at->toIso8601String(),
        ];
    }

    /**
     * What the kid should be told this movement was.
     */
    private function label(PointEntry $entry): string
    {
        $source = $entry->source;

        if ($source instanceof ChoreLog) {
            return $source->chore->name;
        }

        if ($source instanceof Reward) {
            return $source->name;
        }

        return (string) $entry->reason;
    }
}
