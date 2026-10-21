<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Availability\AvailabilitySchedule;
use App\Models\SupportAvailability;
use App\Models\SupportBrand;
use Illuminate\Console\Command;

class SyncSupportBrands extends Command
{
    protected $signature = 'availability:sync-brands {--push : Push the current rules to every enabled brand afterwards}';

    protected $description = 'Copy the support brands (URL and secret) from config into the database';

    public function handle(AvailabilitySchedule $schedule): int
    {
        SupportBrand::syncFromConfig();

        $this->table(
            ['Brand', 'URL', 'Enabled'],
            SupportBrand::query()->orderBy('id')->get()->map(fn (SupportBrand $brand): array => [
                $brand->label,
                $brand->base_url ?? '-',
                $brand->enabled ? 'yes' : 'no',
            ])->all(),
        );

        if ($this->option('push')) {
            if (SupportAvailability::current()->version === 0) {
                $this->warn('The schedule was never saved; nothing to push yet.');

                return self::SUCCESS;
            }

            $this->info("Queued {$schedule->pushToBrands()} push(es).");
        }

        return self::SUCCESS;
    }
}
