<?php

namespace App\Console\Commands;

use App\Services\Line\LineSync;
use Illuminate\Console\Command;

/**
 * Reconciliation safety net for the private line: webhooks deliver the
 * real-time path, this repairs whatever a lost webhook left out.
 */
class SyncLine extends Command
{
    protected $signature = 'line:sync';

    protected $description = 'Mirror recent private-line messages, calls and voicemails from the provider';

    public function handle(LineSync $sync): int
    {
        $sync->syncRecent();

        return self::SUCCESS;
    }
}
