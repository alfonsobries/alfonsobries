<?php

use Carbon\Carbon;
use Illuminate\Console\Scheduling\CallbackEvent;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Container\Container;
use Laravel\Nova\Fields\Attachments\PendingAttachment;

it('schedules the command for deploy the site every minute', function () {
    $schedule = resolve(Schedule::class);

    $events = $schedule->events();
    $commands = collect($events)
        ->map(fn ($event): string => (string) ($event->command ?? ''))
        ->implode("\n");

    expect($events[0])->toBeInstanceof(CallbackEvent::class);
    expect($commands)->toContain('alfonsobries:deploy');
    expect($commands)->toContain('line:sync');
    expect($commands)->toContain('line:sync-number');
    expect($commands)->toContain('line:export');
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
