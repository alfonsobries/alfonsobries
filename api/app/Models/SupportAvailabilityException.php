<?php

declare(strict_types=1);

namespace App\Models;

use App\Availability\AvailabilityException;
use App\Availability\Mode;
use Database\Factories\SupportAvailabilityExceptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A dated span of the support schedule with its own mode (vacations, a day
 * off, an event).
 *
 * @property int $id
 * @property Carbon $starts_at
 * @property Carbon $ends_at
 * @property Mode $mode
 * @property string|null $label
 */
class SupportAvailabilityException extends Model
{
    /** @use HasFactory<SupportAvailabilityExceptionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'starts_at',
        'ends_at',
        'mode',
        'label',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'mode' => Mode::class,
        ];
    }

    public function toRuleException(): AvailabilityException
    {
        return new AvailabilityException(
            $this->starts_at->toImmutable(),
            $this->ends_at->toImmutable(),
            $this->mode,
            $this->label,
            $this->id,
        );
    }
}
