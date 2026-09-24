<?php

use App\Events\ExpensesChanged;
use App\Expenses\ExpenseRecorder;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\PaymentAccount;
use App\Models\User;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    Event::fake([ExpensesChanged::class]);
    $this->alfonso = User::factory()->create(['family_member' => 'alfonso']);
});

it('fills sensible defaults and resolves catalog emoji names', function () {
    $category = ExpenseCategory::factory()->create();

    $expense = app(ExpenseRecorder::class)->create([
        'amount' => '49.999',
        'description' => 'Latte',
        'category_id' => $category->id,
        'emoji' => 'coffee',
    ], $this->alfonso);

    expect((float) $expense->amount)->toBe(50.0)
        ->and($expense->emoji)->toBe('☕')
        ->and($expense->paid_by)->toBe('alfonso')
        ->and($expense->currency)->toBe('MXN');
});

it('ignores unknown emoji names instead of storing them', function () {
    $expense = app(ExpenseRecorder::class)->create([
        'amount' => 10,
        'description' => 'Chicle',
        'emoji' => 'not-a-real-name',
    ], $this->alfonso);

    expect($expense->emoji)->toBeNull();
});

it('falls back to "Otros" when the category does not exist', function () {
    $others = ExpenseCategory::factory()->create(['name' => 'Otros']);

    $expense = app(ExpenseRecorder::class)->create([
        'amount' => 10,
        'description' => 'Algo',
        'category_id' => 9999,
    ], $this->alfonso);

    expect($expense->expense_category_id)->toBe($others->id);
});

it('reads a bare date in the family timezone and never records the future', function () {
    $this->travelTo(now()->setTimezone('America/Mexico_City')->setTime(10, 0));

    $yesterday = app(ExpenseRecorder::class)->create([
        'amount' => 830,
        'description' => 'Luz',
        'spent_at' => now('America/Mexico_City')->subDay()->toDateString(),
    ], $this->alfonso);

    $tomorrow = app(ExpenseRecorder::class)->create([
        'amount' => 10,
        'description' => 'Futuro',
        'spent_at' => now('America/Mexico_City')->addDay()->toDateString(),
    ], $this->alfonso);

    expect($yesterday->spent_at->timezone('America/Mexico_City')->toDateString())
        ->toBe(now('America/Mexico_City')->subDay()->toDateString())
        ->and($tomorrow->spent_at->lte(now()))->toBeTrue();
});

it('rejects a non positive amount', function () {
    app(ExpenseRecorder::class)->create(['amount' => 0, 'description' => 'Nada'], $this->alfonso);
})->throws(InvalidArgumentException::class);

it('lists expenses newest first with filters and pages', function () {
    $mine = Expense::factory()->count(3)->create(['paid_by' => 'alfonso']);
    Expense::factory()->create(['paid_by' => 'saida']);

    $this->actingAs($this->alfonso)
        ->getJson(route('api.expenses.index', ['paid_by' => 'alfonso']))
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('has_more', false);

    $this->actingAs($this->alfonso)
        ->getJson(route('api.expenses.index', ['search' => $mine->first()->description]))
        ->assertOk()
        ->assertJsonPath('data.0.description', $mine->first()->description);
});

it('pages by the last expense on screen without skipping ties', function () {
    $at = now()->subDay();
    $expenses = Expense::factory()->count(55)->create(['spent_at' => $at]);

    $first = $this->actingAs($this->alfonso)->getJson(route('api.expenses.index'))->assertOk();
    $second = $this->actingAs($this->alfonso)
        ->getJson(route('api.expenses.index', ['before' => $first->json('data.49.id')]))
        ->assertOk();

    $ids = collect($first->json('data'))->merge($second->json('data'))->pluck('id');

    expect($ids->unique())->toHaveCount(55)
        ->and($ids->sort()->values()->all())->toBe($expenses->pluck('id')->sort()->values()->all());
});

it('edits, deletes and restores an expense', function () {
    $expense = Expense::factory()->create(['amount' => 50]);
    $account = PaymentAccount::factory()->create();

    $this->actingAs($this->alfonso)
        ->patchJson(route('api.expenses.update', $expense), [
            'amount' => 65.5,
            'payment_account_id' => $account->id,
            'paid_by' => 'saida',
            'emoji' => '🥐',
        ])
        ->assertOk()
        ->assertJsonPath('data.amount', 65.5)
        ->assertJsonPath('data.paid_by', 'saida')
        ->assertJsonPath('data.emoji', '🥐')
        ->assertJsonPath('data.account.id', $account->id);

    $this->actingAs($this->alfonso)
        ->deleteJson(route('api.expenses.destroy', $expense))
        ->assertOk()
        ->assertJsonPath('data.deleted', true);

    expect(Expense::count())->toBe(0);

    $this->actingAs($this->alfonso)
        ->postJson(route('api.expenses.restore', ['expense' => $expense->id]))
        ->assertOk()
        ->assertJsonPath('data.deleted', false);

    expect(Expense::count())->toBe(1);
    Event::assertDispatchedTimes(ExpensesChanged::class, 3);
});

it('adds an expense by hand', function () {
    $category = ExpenseCategory::factory()->create();

    $this->actingAs($this->alfonso)
        ->postJson(route('api.expenses.store'), [
            'amount' => 120,
            'description' => 'Pan',
            'category_id' => $category->id,
        ])
        ->assertCreated()
        ->assertJsonPath('data.source', Expense::SOURCE_MANUAL);
});

it('manages categories and archives the ones with history', function () {
    $created = $this->actingAs($this->alfonso)
        ->postJson(route('api.expense-categories.store'), ['name' => 'Mascotas', 'emoji' => '🐾'])
        ->assertCreated()
        ->json('data');

    $this->actingAs($this->alfonso)
        ->postJson(route('api.expense-categories.store'), ['name' => 'Mascotas', 'emoji' => '🐶'])
        ->assertUnprocessable();

    $used = ExpenseCategory::factory()->create();
    Expense::factory()->create(['expense_category_id' => $used->id]);

    $this->actingAs($this->alfonso)->deleteJson(route('api.expense-categories.destroy', $created['id']))->assertOk();
    $this->actingAs($this->alfonso)->deleteJson(route('api.expense-categories.destroy', $used))->assertOk();

    expect(ExpenseCategory::find($created['id']))->toBeNull()
        ->and($used->fresh()->archived_at)->not->toBeNull();

    $this->actingAs($this->alfonso)
        ->patchJson(route('api.expense-categories.update', $used), ['archived' => false])
        ->assertOk()
        ->assertJsonPath('data.archived', false);
});

it('reorders categories', function () {
    [$a, $b] = ExpenseCategory::factory()->count(2)->create();

    $this->actingAs($this->alfonso)
        ->putJson(route('api.expense-categories.reorder'), ['ids' => [$b->id, $a->id]])
        ->assertOk()
        ->assertJsonPath('data.0.id', $b->id);
});

it('manages payment accounts', function () {
    $account = $this->actingAs($this->alfonso)
        ->postJson(route('api.payment-accounts.store'), [
            'name' => 'Amex Platinum',
            'emoji' => '💳',
            'kind' => PaymentAccount::KIND_CREDIT_CARD,
            'last4' => '1005',
            'owner' => 'alfonso',
        ])
        ->assertCreated()
        ->assertJsonPath('data.owner', 'alfonso')
        ->json('data');

    $this->actingAs($this->alfonso)
        ->patchJson(route('api.payment-accounts.update', $account['id']), ['owner' => null, 'last4' => 'abcd'])
        ->assertUnprocessable();

    $this->actingAs($this->alfonso)
        ->patchJson(route('api.payment-accounts.update', $account['id']), ['owner' => null])
        ->assertOk()
        ->assertJsonPath('data.owner', null);
});
