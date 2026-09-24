<?php

namespace App\Http\Controllers;

use App\Events\ExpensesChanged;
use App\Models\PaymentAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentAccountController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('useHome');

        $accounts = PaymentAccount::query()
            ->orderByRaw('archived_at is not null')
            ->ordered()
            ->get()
            ->map(fn (PaymentAccount $account): array => $account->toApiPayload())
            ->values();

        return response()->json(['data' => $accounts]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate($this->rules(), $this->messages());

        $account = PaymentAccount::create([
            ...$validated,
            'sort_order' => (int) PaymentAccount::max('sort_order') + 1,
        ]);

        ExpensesChanged::dispatch();

        return response()->json(['data' => $account->toApiPayload()], 201);
    }

    public function update(Request $request, PaymentAccount $paymentAccount): JsonResponse
    {
        $this->authorize('useHome');

        $validated = $request->validate([
            ...$this->rules($paymentAccount, sometimes: true),
            'archived' => ['sometimes', 'boolean'],
        ], $this->messages());

        if (array_key_exists('archived', $validated)) {
            $validated['archived_at'] = $validated['archived'] ? now() : null;
            unset($validated['archived']);
        }

        $paymentAccount->update($validated);

        ExpensesChanged::dispatch();

        return response()->json(['data' => $paymentAccount->toApiPayload()]);
    }

    public function destroy(PaymentAccount $paymentAccount): JsonResponse
    {
        $this->authorize('useHome');

        if ($paymentAccount->expenses()->withTrashed()->exists()) {
            $paymentAccount->update(['archived_at' => now()]);
        } else {
            $paymentAccount->delete();
        }

        ExpensesChanged::dispatch();

        return response()->json(['data' => null]);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(?PaymentAccount $ignore = null, bool $sometimes = false): array
    {
        $presence = $sometimes ? 'sometimes' : 'required';

        return [
            'name' => [$presence, 'string', 'max:40', Rule::unique('payment_accounts', 'name')->ignore($ignore)],
            'emoji' => [$presence, 'string', 'max:16'],
            'kind' => [$presence, Rule::in(PaymentAccount::KINDS)],
            'last4' => ['sometimes', 'nullable', 'digits:4'],
            'owner' => ['sometimes', 'nullable', Rule::in(User::MOOD_MEMBERS)],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function messages(): array
    {
        return ['name.unique' => __('home.account_name_taken')];
    }
}
