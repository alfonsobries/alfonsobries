<?php

namespace App\Jobs;

use App\Events\BehaviorIllustrationUpdated;
use App\Models\BehaviorIllustration;
use App\Services\BehaviorIllustrator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class GenerateBehaviorIllustration implements ShouldQueue
{
    use Queueable;

    /**
     * Generation with reference images can take a couple of minutes.
     */
    public int $timeout = 300;

    public int $tries = 1;

    public function __construct(
        public BehaviorIllustration $illustration,
    ) {}

    public function handle(BehaviorIllustrator $illustrator): void
    {
        $illustrator->generate($this->illustration);
    }

    public function failed(?Throwable $exception): void
    {
        $this->illustration->update([
            'status' => BehaviorIllustration::STATUS_FAILED,
            'error' => $exception?->getMessage() ?? 'Generation failed.',
        ]);

        BehaviorIllustrationUpdated::dispatch($this->illustration);
    }
}
