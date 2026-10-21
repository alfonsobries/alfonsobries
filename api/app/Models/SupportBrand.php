<?php

declare(strict_types=1);

namespace App\Models;

use App\Availability\Mode;
use App\Availability\PushError;
use App\Availability\PushStatus;
use Database\Factories\SupportBrandFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A business whose support chat follows Alfonso's availability. The rules
 * are pushed to `{base_url}/support/availability`, signed with the brand's
 * secret, and the brand pulls them back with the same secret.
 *
 * @property int $id
 * @property string $name
 * @property string $label
 * @property string|null $base_url
 * @property string|null $secret
 * @property bool $enabled
 * @property Carbon|null $last_pushed_at
 * @property int|null $last_pushed_version
 * @property PushStatus|null $last_push_status
 * @property PushError|null $last_push_error
 * @property int|null $last_push_http_status
 * @property Mode|null $reported_mode
 * @property Carbon|null $last_pulled_at
 */
class SupportBrand extends Model
{
    /** @use HasFactory<SupportBrandFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'label',
        'base_url',
        'secret',
        'enabled',
        'last_pushed_at',
        'last_pushed_version',
        'last_push_status',
        'last_push_error',
        'last_push_http_status',
        'reported_mode',
        'last_pulled_at',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'secret',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'secret' => 'encrypted',
            'enabled' => 'boolean',
            'last_pushed_at' => 'datetime',
            'last_pushed_version' => 'integer',
            'last_push_status' => PushStatus::class,
            'last_push_error' => PushError::class,
            'last_push_http_status' => 'integer',
            'reported_mode' => Mode::class,
            'last_pulled_at' => 'datetime',
        ];
    }

    /**
     * Upserts every brand in `config('support.brands')`. A brand is enabled
     * only when both its URL and its secret are set; one whose values were
     * removed is disabled rather than deleted, so its sync history stays.
     */
    public static function syncFromConfig(): void
    {
        /** @var array<string, array{label: string, url: string|null, secret: string|null}> $brands */
        $brands = config('support.brands', []);

        foreach ($brands as $name => $brand) {
            $url = filled($brand['url']) ? rtrim((string) $brand['url'], '/') : null;
            $secret = filled($brand['secret']) ? (string) $brand['secret'] : null;

            self::query()->updateOrCreate(['name' => $name], [
                'label' => $brand['label'],
                'base_url' => $url,
                'secret' => $secret,
                'enabled' => $url !== null && $secret !== null,
            ]);
        }
    }

    public function isConfigured(): bool
    {
        return filled($this->base_url) && filled($this->secret);
    }

    public function pushUrl(): string
    {
        return rtrim((string) $this->base_url, '/').'/support/availability';
    }

    public function recordPush(
        PushStatus $status,
        int $version,
        ?PushError $error = null,
        ?int $httpStatus = null,
        ?Mode $reportedMode = null,
    ): void {
        $this->forceFill([
            'last_pushed_at' => now(),
            'last_pushed_version' => $version,
            'last_push_status' => $status,
            'last_push_error' => $error,
            'last_push_http_status' => $httpStatus,
            'reported_mode' => $reportedMode ?? $this->reported_mode,
        ])->save();
    }

    /**
     * The shape the app receives. The secret never leaves the API.
     *
     * @return array{name: string, label: string, enabled: bool, configured: bool, last_pushed_at: string|null, last_pushed_version: int|null, last_push_status: string|null, last_push_error: string|null, last_push_http_status: int|null, reported_mode: string|null, last_pulled_at: string|null}
     */
    public function toApiPayload(): array
    {
        return [
            'name' => $this->name,
            'label' => $this->label,
            'enabled' => $this->enabled,
            'configured' => $this->isConfigured(),
            'last_pushed_at' => $this->last_pushed_at?->toIso8601String(),
            'last_pushed_version' => $this->last_pushed_version,
            'last_push_status' => $this->last_push_status?->value,
            'last_push_error' => $this->last_push_error?->value,
            'last_push_http_status' => $this->last_push_http_status,
            'reported_mode' => $this->reported_mode?->value,
            'last_pulled_at' => $this->last_pulled_at?->toIso8601String(),
        ];
    }
}
