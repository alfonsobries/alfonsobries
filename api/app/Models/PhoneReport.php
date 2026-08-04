<?php

namespace App\Models;

use App\Observers\PhoneReportObserver;
use Database\Factories\PhoneReportFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A kid saying dad was on his phone when he should have been with them. He
 * confirms it or marks it as work; a confirmed one buys the family time
 * together.
 */
#[ObservedBy(PhoneReportObserver::class)]
class PhoneReport extends Model
{
    /** @use HasFactory<PhoneReportFactory> */
    use HasFactory;

    /**
     * The kid pressed the button; dad hasn't answered yet.
     */
    public const STATUS_PENDING = 'pending';

    public const STATUS_CONFIRMED = 'confirmed';

    /**
     * It was work or something that couldn't wait — no time owed, but the kid
     * still sees the answer.
     */
    public const STATUS_WORK = 'work';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'family_member',
        'date',
        'status',
        'reviewed_by',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

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

    public function isReviewed(): bool
    {
        return $this->status !== self::STATUS_PENDING;
    }
}
