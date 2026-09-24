<?php

use App\AI\Home\HomeAgent;
use App\Events\ExpensesChanged;
use App\Events\HomeMessageUpdated;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\HomeMessage;
use App\Models\PaymentAccount;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Responses\Data\ToolCall;
use Laravel\Ai\Transcription;

beforeEach(function () {
    Event::fake([HomeMessageUpdated::class, ExpensesChanged::class]);
});

it('records an expense from a chat message and links it to the reply', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $coffee = ExpenseCategory::factory()->create(['name' => 'Café y antojos', 'emoji' => '☕']);
    $amex = PaymentAccount::factory()->create(['name' => 'Amex', 'owner' => 'alfonso']);

    HomeAgent::fake([
        new ToolCall('call_1', 'record_expenses', ['items' => [[
            'amount' => 100,
            'description' => 'Café',
            'category_id' => $coffee->id,
            'payment_account_id' => $amex->id,
            'emoji' => 'coffee',
        ]]]),
        'Listo ☕',
    ]);

    $response = $this->actingAs($alfonso)
        ->postJson(route('api.home.messages.store'), ['content' => '100 con mi amex para un café'])
        ->assertCreated();

    expect($response->json('data.reply.error'))->toBeNull()
        ->and($response->json('data.reply.status'))->toBe(HomeMessage::STATUS_COMPLETED)
        ->and($response->json('data.reply.content'))->toBe('Listo ☕')
        ->and($response->json('data.reply.expenses'))->toHaveCount(1)
        ->and($response->json('data.reply.expenses.0.action'))->toBe('created')
        ->and($response->json('data.reply.expenses.0.emoji'))->toBe('☕')
        ->and($response->json('data.reply.expenses.0.account.name'))->toBe('Amex');

    $expense = Expense::sole();

    expect((float) $expense->amount)->toBe(100.0)
        ->and($expense->paid_by)->toBe('alfonso')
        ->and($expense->currency)->toBe('MXN')
        ->and($expense->user_id)->toBe($alfonso->id);

    Event::assertDispatched(ExpensesChanged::class);
});

it('creates a card the first time it is mentioned and reuses it after', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $coffee = ExpenseCategory::factory()->create();

    $item = [
        'amount' => 100,
        'description' => 'Café',
        'category_id' => $coffee->id,
        'payment_account_name' => 'Amex',
        'payment_account_kind' => PaymentAccount::KIND_CREDIT_CARD,
        'payment_account_owner' => 'alfonso',
    ];

    HomeAgent::fake([
        new ToolCall('call_1', 'record_expenses', ['items' => [$item]]),
        'Listo',
        new ToolCall('call_2', 'record_expenses', ['items' => [[...$item, 'payment_account_name' => 'mi amex']]]),
        'Listo',
    ]);

    $this->actingAs($alfonso)->postJson(route('api.home.messages.store'), ['content' => '100 con mi amex'])->assertCreated();
    $this->actingAs($alfonso)->postJson(route('api.home.messages.store'), ['content' => 'otros 100 con mi amex'])->assertCreated();

    $account = PaymentAccount::sole();

    expect($account->name)->toBe('Amex')
        ->and($account->owner)->toBe('alfonso')
        ->and(Expense::where('payment_account_id', $account->id)->count())->toBe(2);
});

it('tells the model which expenses earlier answers touched so it can correct them', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $expense = Expense::factory()->create(['description' => 'Café', 'amount' => 50]);
    HomeMessage::factory()->create(['user_id' => $alfonso->id, 'content' => '50 de café']);
    $answer = HomeMessage::factory()->assistant()->create(['user_id' => $alfonso->id]);
    $answer->expenses()->attach($expense->id, ['action' => 'created']);

    HomeAgent::fake([
        new ToolCall('call_1', 'update_expense', ['expense_id' => $expense->id, 'amount' => 60]),
        'Corregido, $60',
    ]);

    $this->actingAs($alfonso)
        ->postJson(route('api.home.messages.store'), ['content' => 'no, eran 60'])
        ->assertCreated()
        ->assertJsonPath('data.reply.expenses.0.action', 'updated');

    expect((float) $expense->fresh()->amount)->toBe(60.0);

    HomeAgent::assertPrompted(function ($prompt) use ($expense): bool {
        $history = collect($prompt->agent->messages());

        return $history->count() === 2
            && str_contains($history->last()->content, "#{$expense->id}")
            && $prompt->prompt === 'no, eran 60';
    });
});

it('transcribes a voice note and answers what it said', function () {
    Storage::fake('s3');
    Storage::fake('public');
    Storage::disk('s3')->put('temp/uploads/note.m4a', 'fake-audio');

    Transcription::fake(['Gasté 830 de luz']);
    HomeAgent::fake(['Anotado']);

    $saida = User::factory()->create(['family_member' => 'saida']);

    $response = $this->actingAs($saida)
        ->postJson(route('api.home.messages.store'), [
            'audio_path' => 'temp/uploads/note.m4a',
            'audio_duration' => 3200,
        ])
        ->assertCreated();

    expect($response->json('data.message.transcript'))->toBe('Gasté 830 de luz')
        ->and($response->json('data.message.audio.duration'))->toBe(3200);

    HomeAgent::assertPrompted(fn ($prompt): bool => $prompt->prompt === 'Gasté 830 de luz');
});

it('returns the first result when the app retries a send', function () {
    HomeAgent::fake(['Listo', 'Otra vez']);

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $first = $this->actingAs($alfonso)
        ->postJson(route('api.home.messages.store'), ['content' => '50 de café', 'client_key' => 'abc'])
        ->assertCreated();

    $second = $this->actingAs($alfonso)
        ->postJson(route('api.home.messages.store'), ['content' => '50 de café', 'client_key' => 'abc'])
        ->assertCreated();

    expect($second->json('data.message.id'))->toBe($first->json('data.message.id'))
        ->and(HomeMessage::count())->toBe(2);
});

it('marks the reply failed when the model blows up', function () {
    HomeAgent::fake(fn () => throw new RuntimeException('model unavailable'));

    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.home.messages.store'), ['content' => '50 de café'])
        ->assertCreated();

    expect(HomeMessage::where('role', HomeMessage::ROLE_ASSISTANT)->sole()->status)->toBe(HomeMessage::STATUS_FAILED);
});

it('requires something to say', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);

    $this->actingAs($alfonso)
        ->postJson(route('api.home.messages.store'), ['content' => '  '])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('content');
});

it('pages through the chat newest first', function () {
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $messages = HomeMessage::factory()->count(45)->create(['user_id' => $alfonso->id]);
    HomeMessage::factory()->create();

    $page = $this->actingAs($alfonso)->getJson(route('api.home.messages.index'))->assertOk();

    expect($page->json('data'))->toHaveCount(40)
        ->and($page->json('has_more'))->toBeTrue()
        ->and($page->json('data.0.id'))->toBe($messages->last()->id);

    $next = $this->actingAs($alfonso)
        ->getJson(route('api.home.messages.index', ['before' => $page->json('data.39.id')]))
        ->assertOk();

    expect($next->json('data'))->toHaveCount(5)->and($next->json('has_more'))->toBeFalse();
});

it('keeps the chat to the couple and each person to their own messages', function () {
    $kid = User::factory()->create(['family_member' => 'regina']);
    $alfonso = User::factory()->create(['family_member' => 'alfonso']);
    $saidasMessage = HomeMessage::factory()->create([
        'user_id' => User::factory()->create(['family_member' => 'saida'])->id,
    ]);

    $this->actingAs($kid)->getJson(route('api.home.messages.index'))->assertForbidden();
    $this->actingAs($kid)->getJson(route('api.expenses.index'))->assertForbidden();

    $this->actingAs($alfonso)
        ->getJson(route('api.home.messages.show', ['homeMessage' => $saidasMessage]))
        ->assertForbidden();
});
