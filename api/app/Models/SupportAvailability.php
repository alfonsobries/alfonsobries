<?php

declare(strict_types=1);

namespace App\Models;

use App\Availability\AvailabilityException;
use App\Availability\AvailabilityOverride;
use App\Availability\AvailabilityRules;
use App\Availability\Mode;
use App\Availability\WeeklyWindow;
use Carbon\CarbonImmutable;
use Database\Factories\SupportAvailabilityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Alfonso's support availability: the one schedule every brand's chat
 * follows. A single row; `version` increases on every change so brands can
 * drop out-of-order pushes.
 *
 * @property int $id
 * @property string $timezone
 * @property list<array{days: list<int>, from: string, to: string}> $weekly
 * @property Mode $outside_hours_mode
 * @property Mode|null $override_mode
 * @property Carbon|null $override_until
 * @property int $version
 * @property Carbon|null $updated_at
 */
class SupportAvailability extends Model
{
    /** @use HasFactory<SupportAvailabilityFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'timezone',
        'weekly',
        'outside_hours_mode',
        'override_mode',
        'override_until',
        'version',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'weekly' => 'array',
            'outside_hours_mode' => Mode::class,
            'override_mode' => Mode::class,
            'override_until' => 'datetime',
            'version' => 'integer',
        ];
    }

    /**
     * The record, created with a weekday office-hours default the first time.
     * Version 0 means nothing was ever saved, so nothing is shared yet.
     */
    public static function current(): self
    {
        return self::query()->first() ?? self::query()->create([
            'timezone' => (string) config('support.timezone'),
            'weekly' => [['days' => [1, 2, 3, 4, 5], 'from' => '09:00', 'to' => '18:00']],
            'outside_hours_mode' => Mode::Bot,
            'version' => 0,
        ]);
    }

    /**
     * The rules as brands receive them. Exceptions that already ended are
     * left out: they can never apply again.
     */
    public function toRules(?CarbonImmutable $now = null): AvailabilityRules
    {
        $now ??= CarbonImmutable::now();

        $exceptions = SupportAvailabilityException::query()
            ->where('ends_at', '>', $now)
            ->orderBy('starts_at')
            ->orderBy('id')
            ->get()
            ->map(fn (SupportAvailabilityException $exception): AvailabilityException => $exception->toRuleException())
            ->values()
            ->all();

        return new AvailabilityRules(
            version: $this->version,
            timezone: $this->timezone,
            weekly: array_map(WeeklyWindow::fromArray(...), $this->weekly),
            outsideHoursMode: $this->outside_hours_mode,
            exceptions: $exceptions,
            override: $this->override_mode === null ? null : new AvailabilityOverride(
                $this->override_mode,
                $this->override_until?->toImmutable(),
            ),
            updatedAt: $this->updated_at?->toImmutable(),
        );
    }
}
