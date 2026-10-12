<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Climate\CarrierException;
use App\Climate\ClimateAutomation;
use Illuminate\Console\Command;

class EnforceClimateAutomation extends Command
{
    protected $signature = 'climate:enforce';

    protected $description = 'Switch the air conditioners off when nobody is home, and back on when someone returns';

    public function handle(ClimateAutomation $automation): int
    {
        try {
            $automation->enforce();
        } catch (CarrierException $exception) {
            report($exception);

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
