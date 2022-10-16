<?php

use Carbon\Carbon;
use Laravel\Nova\Trix\PendingAttachment;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Container\Container;
use Illuminate\Console\Scheduling\CallbackEvent;

it('schedules the command for deploy the site every minute', function () {
    $schedule = resolve(Schedule::class);

    $events = $schedule->events();
    expect($events)->toHaveCount(2);

    expect($events[0])->toBeInstanceof(CallbackEvent::class);
    expect($events[1]->command)->toContain('alfonsobries:deploy');
});

it('the callback defined on the schedule prunes the trix attachemnts', function () {
    $schedule = resolve(Schedule::class);
    $events = $schedule->events();
    $callback = $events[0];

    $attachment = PendingAttachment::create([
        'draft_id' => 134,
        'attachment' => 'test.jpg',
        'disk' => 'local',
        'created_at' => Carbon::now()->subDay(),
    ]);

    $callback->run(app(Container::class));

    expect($attachment->fresh())->toBeNull();
});
