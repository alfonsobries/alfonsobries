<?php

namespace App\Models;

use App\Observers\PhoneReportObserver;
use Database\Factories\PhoneReportFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A kid saying dad was on his phone instead of with them. The button only
 * gets pressed with his phone in their hands, so pressing it is the whole
 * story: the family is owed time together, no answer needed.
 */
#[ObservedBy(PhoneReportObserver::class)]
class PhoneReport extends Model
{
    /** @use HasFactory<PhoneReportFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'family_member',
        'date',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Today where the family lives — the one-a-day rule has to break at their
     * midnight, not at the server's.
     */
    public static function currentDate(): string
    {
        return now()->timezone(config('family.timezone'))->toDateString();
    }

    /**
     * @param  Builder<PhoneReport>  $query
     */
    public function scopeToday($query): void
    {
        $query->whereDate('date', self::currentDate());
    }
}
