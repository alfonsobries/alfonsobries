<?php

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Carbon\CarbonImmutable;

beforeEach(function () {
    $this->travelTo(now('America/Mexico_City')->setDate(2026, 9, 20)->setTime(12, 0));
    $this->alfonso = User::factory()->create(['family_member' => 'alfonso']);
});

function localDay(string $date, string $time = '12:00'): CarbonImmutable
{
    return CarbonImmutable::parse("{$date} {$time}", 'America/Mexico_City');
}

it('summarizes a month by category, person and day', function () {
    $food = ExpenseCategory::factory()->create(['name' => 'Súper']);
    $coffee = ExpenseCategory::factory()->create(['name' => 'Café y antojos']);

    Expense::factory()->create(['expense_category_id' => $food->id, 'amount' => 1000, 'paid_by' => 'saida', 'spent_at' => localDay('2026-09-03')]);
    Expense::factory()->create(['expense_category_id' => $coffee->id, 'amount' => 100, 'paid_by' => 'alfonso', 'spent_at' => localDay('2026-09-03')]);
    Expense::factory()->create(['expense_category_id' => $coffee->id, 'amount' => 60, 'paid_by' => 'alfonso', 'spent_at' => localDay('2026-09-10')]);
    // Late at night locally is already the next day in UTC; it still counts for September.
    Expense::factory()->create(['expense_category_id' => $coffee->id, 'amount' => 40, 'paid_by' => 'alfonso', 'spent_at' => localDay('2026-09-30', '23:30')]);
    Expense::factory()->create(['amount' => 500, 'spent_at' => localDay('2026-08-15')]);
    Expense::factory()->create(['amount' => 20, 'currency' => 'USD', 'spent_at' => localDay('2026-09-05')]);
    Expense::factory()->create(['amount' => 999, 'spent_at' => localDay('2026-09-05')])->delete();

    $summary = $this->actingAs($this->alfonso)
        ->getJson(route('api.expenses.summary', [
            'from' => localDay('2026-09-01', '00:00')->toIso8601String(),
            'to' => localDay('2026-10-01', '00:00')->toIso8601String(),
        ]))
        ->assertOk()
        ->json('data');

    expect($summary['total'])->toEqual(1200)
        ->and($summary['count'])->toBe(4)
        ->and($summary['previous_total'])->toEqual(500)
        ->and($summary['by_category'][0]['category']['name'])->toBe('Súper')
        ->and($summary['by_category'][1]['total'])->toEqual(200)
        ->and(collect($summary['by_person'])->firstWhere('member', 'saida')['total'])->toEqual(1000)
        ->and($summary['series']['unit'])->toBe('day')
        ->and($summary['series']['points'])->toHaveCount(30)
        ->and($summary['series']['points'][2])->toEqual(['date' => '2026-09-03', 'total' => 1100])
        ->and($summary['series']['points'][29]['total'])->toEqual(40)
        ->and($summary['other_currencies'])->toEqual([['currency' => 'USD', 'total' => 20, 'count' => 1]]);
});

it('charts long periods by month', function () {
    Expense::factory()->create(['amount' => 100, 'spent_at' => localDay('2026-02-10')]);

    $summary = $this->actingAs($this->alfonso)
        ->getJson(route('api.expenses.summary', [
            'from' => localDay('2026-01-01', '00:00')->toIso8601String(),
            'to' => localDay('2027-01-01', '00:00')->toIso8601String(),
        ]))
        ->assertOk()
        ->json('data');

    expect($summary['series']['unit'])->toBe('month')
        ->and($summary['series']['points'])->toHaveCount(12)
        ->and($summary['series']['points'][1]['total'])->toEqual(100);
});

it('filters the summary by person', function () {
    Expense::factory()->create(['amount' => 100, 'paid_by' => 'alfonso', 'spent_at' => localDay('2026-09-03')]);
    Expense::factory()->create(['amount' => 300, 'paid_by' => 'saida', 'spent_at' => localDay('2026-09-03')]);

    $this->actingAs($this->alfonso)
        ->getJson(route('api.expenses.summary', [
            'from' => localDay('2026-09-01', '00:00')->toIso8601String(),
            'to' => localDay('2026-10-01', '00:00')->toIso8601String(),
            'paid_by' => 'saida',
        ]))
        ->assertOk()
        ->assertJsonPath('data.total', 300);
});
