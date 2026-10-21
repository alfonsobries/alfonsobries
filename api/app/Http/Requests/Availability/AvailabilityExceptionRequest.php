<?php

declare(strict_types=1);

namespace App\Http\Requests\Availability;

use App\Availability\Mode;
use App\Models\SupportAvailability;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * A dated exception. Times without an offset are read in the schedule's
 * timezone, so the app can send plain wall-clock dates.
 */
class AvailabilityExceptionRequest extends FormRequest
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
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date'],
            'mode' => ['required', Rule::enum(Mode::class)],
            'label' => ['nullable', 'string', 'max:60'],
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

                if ($this->endsAt()->lessThanOrEqualTo($this->startsAt())) {
                    $validator->errors()->add('ends_at', 'El final debe ser después del inicio.');
                } elseif ($this->endsAt()->isPast()) {
                    $validator->errors()->add('ends_at', 'Esa fecha ya pasó.');
                }
            },
        ];
    }

    public function startsAt(): CarbonImmutable
    {
        return $this->parse('starts_at');
    }

    public function endsAt(): CarbonImmutable
    {
        return $this->parse('ends_at');
    }

    /**
     * @return array{starts_at: CarbonImmutable, ends_at: CarbonImmutable, mode: Mode, label: string|null}
     */
    public function exceptionAttributes(): array
    {
        $label = trim((string) $this->input('label'));

        return [
            'starts_at' => $this->startsAt(),
            'ends_at' => $this->endsAt(),
            'mode' => Mode::from((string) $this->input('mode')),
            'label' => $label === '' ? null : $label,
        ];
    }

    private function parse(string $key): CarbonImmutable
    {
        return CarbonImmutable::parse((string) $this->input($key), SupportAvailability::current()->timezone)->utc();
    }
}
