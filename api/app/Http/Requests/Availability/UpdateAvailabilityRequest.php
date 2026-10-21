<?php

declare(strict_types=1);

namespace App\Http\Requests\Availability;

use App\Availability\Mode;
use App\Availability\WeeklyWindow;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * The editable part of the schedule: timezone, weekly windows and what
 * happens outside them. Windows never cross midnight; `24:00` is only valid
 * as an end.
 */
class UpdateAvailabilityRequest extends FormRequest
{
    public const TIME = '/^([01]\d|2[0-3]):[0-5]\d$/';

    public const END_TIME = '/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/';

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
            'timezone' => ['required', 'string', 'timezone:all'],
            'outside_hours_mode' => ['required', Rule::in([Mode::Bot->value, Mode::Offline->value])],
            'weekly' => ['present', 'array', 'max:50'],
            'weekly.*' => ['array:days,from,to'],
            'weekly.*.days' => ['required', 'array', 'min:1', 'max:7'],
            'weekly.*.days.*' => ['integer', 'between:1,7', 'distinct'],
            'weekly.*.from' => ['required', 'string', 'regex:'.self::TIME],
            'weekly.*.to' => ['required', 'string', 'regex:'.self::END_TIME],
        ];
    }

    /**
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                foreach ((array) $this->input('weekly', []) as $index => $window) {
                    if (WeeklyWindow::minuteOfDay($window['from']) >= WeeklyWindow::minuteOfDay($window['to'])) {
                        $validator->errors()->add("weekly.{$index}.to", __('availability.window_end_before_start'));
                    }
                }
            },
        ];
    }

    /**
     * @return list<array{days: list<int>, from: string, to: string}>
     */
    public function weekly(): array
    {
        /** @var array<int, array{days: array<int, int|string>, from: string, to: string}> $weekly */
        $weekly = $this->validated('weekly');

        return array_map(fn (array $window): array => [
            'days' => array_map(intval(...), array_values($window['days'])),
            'from' => $window['from'],
            'to' => $window['to'],
        ], array_values($weekly));
    }
}
