<?php

declare(strict_types=1);

namespace App\Http\Requests\Availability;

use App\Availability\AvailabilitySchedule;
use App\Availability\Mode;
use App\Models\SupportAvailability;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * A quick "right now" mode: for some hours, until a given time, until
 * tomorrow morning, or (with none of those) until it is removed.
 */
class StoreAvailabilityOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'mode' => ['required', Rule::enum(Mode::class)],
            'hours' => ['nullable', 'integer', 'between:1,168', 'prohibits:until,tomorrow'],
            'until' => ['nullable', 'date', 'prohibits:hours,tomorrow'],
            'tomorrow' => ['nullable', 'boolean', 'prohibits:hours,until'],
        ];
    }

    /**
     * `until` may be wall-clock time in the schedule's timezone, so "is it in
     * the future" is decided after reading it there.
     *
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty() || ! $this->filled('until')) {
                    return;
                }

                if (! $this->untilAt()->isFuture()) {
                    $validator->errors()->add('until', __('availability.override_in_the_past'));
                }
            },
        ];
    }

    public function mode(): Mode
    {
        return Mode::from((string) $this->validated('mode'));
    }

    public function until(AvailabilitySchedule $schedule): ?CarbonImmutable
    {
        if ($this->filled('hours')) {
            return CarbonImmutable::now()->addHours((int) $this->validated('hours'));
        }

        if ($this->filled('until')) {
            return $this->untilAt();
        }

        if ($this->boolean('tomorrow')) {
            return $schedule->tomorrowMorning();
        }

        return null;
    }

    private function untilAt(): CarbonImmutable
    {
        return CarbonImmutable::parse((string) $this->input('until'), SupportAvailability::current()->timezone)->utc();
    }
}
