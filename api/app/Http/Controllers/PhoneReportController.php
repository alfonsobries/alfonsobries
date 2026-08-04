<?php

namespace App\Http\Controllers;

use App\Models\PhoneReport;
use App\Models\User;
use App\Services\FamilyTimeBank;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PhoneReportController extends Controller
{
    /**
     * How far back the list looks — enough for the app to draw the last two
     * weeks of days.
     */
    private const HISTORY_DAYS = 14;

    public function __construct(
        private readonly FamilyTimeBank $bank,
    ) {}

    /**
     * The recent reports, newest first.
     */
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $reports = PhoneReport::whereDate('date', '>=', now()->subDays(self::HISTORY_DAYS)->toDateString())
            ->latest('date')
            ->latest('id')
            ->get()
            ->map(fn (PhoneReport $report): array => $this->present($report))
            ->values();

        return response()->json([
            'data' => $reports,
            'minutes' => $this->bank->balance(),
        ]);
    }

    /**
     * A kid says dad is on his phone. One a day each: pressing again returns
     * the report they already made.
     */
    public function store(Request $request): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'family_member' => ['required', Rule::in(User::KID_MEMBERS)],
        ]);

        $report = PhoneReport::today()
            ->where('family_member', $validated['family_member'])
            ->first();

        $report ??= PhoneReport::create([
            'family_member' => $validated['family_member'],
            'date' => now()->toDateString(),
            'status' => PhoneReport::STATUS_PENDING,
        ]);

        return response()->json(
            ['data' => $this->present($report)],
            $report->wasRecentlyCreated ? 201 : 200,
        );
    }

    /**
     * Dad's answer: he agrees, and the family is owed time together — or it
     * was work, which the kid still gets to see.
     */
    public function review(Request $request, PhoneReport $phoneReport): JsonResponse
    {
        if ($response = $this->guard($request)) {
            return $response;
        }

        $validated = $request->validate([
            'confirmed' => ['required', 'boolean'],
        ]);

        $phoneReport->update([
            'status' => $validated['confirmed'] ? PhoneReport::STATUS_CONFIRMED : PhoneReport::STATUS_WORK,
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json([
            'data' => $this->present($phoneReport),
            'minutes' => $this->bank->balance(),
        ]);
    }

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can use phone reports.'], 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function present(PhoneReport $report): array
    {
        return [
            'id' => $report->id,
            'family_member' => $report->family_member,
            'date' => $report->date->toDateString(),
            'status' => $report->status,
            'minutes' => $report->status === PhoneReport::STATUS_CONFIRMED
                ? FamilyTimeBank::MINUTES_PER_REPORT
                : 0,
        ];
    }
}
