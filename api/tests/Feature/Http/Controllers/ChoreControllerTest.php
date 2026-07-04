<?php

use App\Models\Chore;
use App\Models\ChoreLog;
use App\Models\User;

it('lists the chores of a kid with today state', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $teeth = Chore::factory()->create(['family_member' => 'regina', 'name' => 'Lavarse los dientes']);
    Chore::factory()->create(['family_member' => 'regina', 'name' => 'Guardar juguetes']);
    Chore::factory()->create(['family_member' => 'andres', 'name' => 'Recoger bloques']);

    ChoreLog::factory()->create(['chore_id' => $teeth->id, 'family_member' => 'regina']);

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.chores.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.name', 'Lavarse los dientes')
        ->assertJsonPath('data.0.today.status', ChoreLog::STATUS_DONE)
        ->assertJsonPath('data.1.today', null);
});

it('ignores yesterday checks in today state', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $chore = Chore::factory()->create(['family_member' => 'regina']);
    ChoreLog::factory()->create([
        'chore_id' => $chore->id,
        'family_member' => 'regina',
        'date' => now()->subDay()->toDateString(),
    ]);

    $this->actingAs($alfonso)
        ->getJson(route('api.kids.chores.index', ['member' => 'regina']))
        ->assertOk()
        ->assertJsonPath('data.0.today', null);
});

it('creates a chore', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.chores.store'), [
            'family_member' => 'regina',
            'name' => 'Lavarse los dientes',
            'points' => 2,
        ])
        ->assertCreated()
        ->assertJson(['data' => ['family_member' => 'regina', 'name' => 'Lavarse los dientes', 'points' => 2]]);

    expect(Chore::count())->toBe(1);
});

it('updates a chore', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $chore = Chore::factory()->create(['family_member' => 'regina', 'name' => 'Dientes']);

    $this->actingAs($alfonso)
        ->patchJson(route('api.chores.update', ['chore' => $chore]), ['name' => 'Lavarse los dientes'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Lavarse los dientes');
});

it('soft deletes a chore', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $chore = Chore::factory()->create(['family_member' => 'regina']);

    $this->actingAs($alfonso)
        ->deleteJson(route('api.chores.destroy', ['chore' => $chore]))
        ->assertOk();

    expect(Chore::count())->toBe(0);
    expect(Chore::withTrashed()->count())->toBe(1);
});

it('validates the chore payload', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.chores.store'), [
            'family_member' => 'saida',
            'name' => '',
            'points' => 0,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['family_member', 'name', 'points']);
});

it('forbids a non family member from managing chores', function () {
    $stranger = User::factory()->create(['family_member' => null]);

    $this->actingAs($stranger)
        ->postJson(route('api.chores.store'), [
            'family_member' => 'regina',
            'name' => 'Dientes',
            'points' => 1,
        ])
        ->assertForbidden();
});

it('requires authentication to list chores', function () {
    $this->getJson(route('api.kids.chores.index', ['member' => 'regina']))
        ->assertUnauthorized();
});
