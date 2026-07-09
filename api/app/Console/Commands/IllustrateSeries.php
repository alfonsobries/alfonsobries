<?php

namespace App\Console\Commands;

use App\Exceptions\Images\ImageProviderException;
use App\Images\ImageManager;
use App\Services\IllustrationProcessor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class IllustrateSeries extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'illustrate:series
        {series=wolf : Series name; reads resources/illustrations/<series>-series.php}
        {--from=1 : First stage to generate (resumes from the previous raw image)}
        {--to= : Last stage to generate; defaults to the whole series}
        {--attempts=3 : Generation attempts per stage before keeping the last one}
        {--dir= : Output directory; defaults to storage/app/illustrations/<series>}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a progressive illustration series, validating each stage against its description and the previous stage';

    private const IMAGE_OPTIONS = ['model' => 'gpt-image-2', 'quality' => 'low'];

    private const REVIEWER_MODEL = 'gpt-5-mini';

    public function handle(ImageManager $images, IllustrationProcessor $processor): int
    {
        $series = (string) $this->argument('series');
        $definition = resource_path("illustrations/{$series}-series.php");

        if (! File::exists($definition)) {
            $this->error("Unknown series '{$series}': missing {$definition}.");

            return 1;
        }

        /** @var array{reference: string, identity: string, progression: string, stages: array<int, string>} $config */
        $config = require $definition;

        /** @var array<int, string> $stages */
        $stages = $config['stages'];
        $total = count($stages);

        $from = max(1, (int) $this->option('from'));
        $to = min($total, (int) ($this->option('to') ?: $total));
        $attempts = max(1, (int) $this->option('attempts'));

        $dir = $this->option('dir') ?: storage_path("app/illustrations/{$series}");
        File::ensureDirectoryExists("{$dir}/raw");

        $sheet = File::get(resource_path($config['reference']));
        $provider = $images->provider('openai');

        $previous = null;

        if ($from > 1) {
            $previousPath = sprintf('%s/raw/%s-%02d.png', $dir, $series, $from - 1);

            if (! File::exists($previousPath)) {
                $this->error("Cannot resume from stage {$from}: missing {$previousPath}.");

                return 1;
            }

            $previous = File::get($previousPath);
        }

        foreach (range($from, $to) as $stage) {
            $subject = sprintf('Stage %d of %d: %s', $stage, $total, $stages[$stage]);

            $this->info(sprintf('[%02d/%02d] Generating…', $stage, $to));

            $raw = null;
            $verdict = ['approved' => false, 'reason' => ''];

            foreach (range(1, $attempts) as $attempt) {
                try {
                    $raw = $provider->generate(
                        $this->composePrompt($config, $subject, $previous !== null, $verdict['reason']),
                        $previous === null ? [$sheet] : [$sheet, $previous],
                        self::IMAGE_OPTIONS,
                    );
                } catch (ImageProviderException $exception) {
                    // Transient provider hiccups shouldn't kill a long run.
                    $this->warn(sprintf(
                        '[%02d/%02d] Attempt %d errored: %s',
                        $stage,
                        $to,
                        $attempt,
                        $exception->getMessage(),
                    ));
                    sleep(15);

                    continue;
                }

                $verdict = $this->review($subject, $raw, $previous);

                if ($verdict['approved']) {
                    break;
                }

                $this->warn(sprintf(
                    '[%02d/%02d] Attempt %d rejected: %s',
                    $stage,
                    $to,
                    $attempt,
                    $verdict['reason'],
                ));
            }

            if ($raw === null) {
                $this->error(sprintf(
                    '[%02d/%02d] Every attempt errored. Resume with --from=%d.',
                    $stage,
                    $to,
                    $stage,
                ));

                return 1;
            }

            if (! $verdict['approved']) {
                $this->warn(sprintf(
                    '[%02d/%02d] No attempt was approved — keeping the last one. Re-run with --from=%d to retry.',
                    $stage,
                    $to,
                    $stage,
                ));
            }

            File::put(sprintf('%s/raw/%s-%02d.png', $dir, $series, $stage), $raw);

            $final = $processor->padToAspect($processor->chromaKeyToTransparent($raw), 1, 1);
            File::put(sprintf('%s/%s-%02d.png', $dir, $series, $stage), $final);

            $this->info(sprintf('[%02d/%02d] Saved. %s', $stage, $to, $verdict['reason']));

            $previous = $raw;
        }

        $this->info("Done. Output in {$dir}");

        return 0;
    }

    /**
     * @param  array{reference: string, identity: string, progression: string, stages: array<int, string>}  $config
     */
    private function composePrompt(array $config, string $subject, bool $hasPrevious, string $feedback): string
    {
        $parts = [];

        $parts[] = $hasPrevious
            ? 'The FIRST attached image is the canonical style reference sheet. '
                .'The LAST attached image is the immediately previous stage of the series.'
            : 'The attached image is the canonical style reference sheet.';

        $parts[] = $this->promptFile('illustrations/style-base.md');

        $parts[] = Str::squish($config['identity']);

        if ($hasPrevious) {
            $parts[] = Str::squish($config['progression']);
        }

        $parts[] = $this->promptFile('illustrations/background-chroma.md');

        $parts[] = 'Subject: '.$subject;

        if ($feedback !== '') {
            $parts[] = 'A reviewer rejected the previous attempt for this reason — fix it: '.$feedback;
        }

        return implode(' ', $parts);
    }

    /**
     * Ask the reviewer model whether the candidate matches the stage
     * description and reads as progress from the previous stage. Lenient by
     * instruction; a validator outage approves rather than blocking the run.
     *
     * @return array{approved: bool, reason: string}
     */
    private function review(string $subject, string $candidate, ?string $previous): array
    {
        $content = [[
            'type' => 'text',
            'text' => ($previous === null
                ? 'The attached image is the candidate to review.'
                : 'The FIRST attached image is the previous stage (context only). The LAST attached image is the candidate to review.')
                ."\n\n".$subject,
        ]];

        if ($previous !== null) {
            $content[] = $this->imageContent($previous);
        }

        $content[] = $this->imageContent($candidate);

        try {
            $response = Http::withToken((string) config('images.providers.openai.api_key'))
                ->timeout(120)
                ->post(rtrim((string) config('images.providers.openai.base_url'), '/').'/chat/completions', [
                    'model' => self::REVIEWER_MODEL,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You review one stage of a progressive illustrated series that must only '
                                .'ever improve/grow stage over stage. Approve unless something is clearly wrong. '
                                .'Reject only if: the image clearly does not match the stage description; the '
                                .'subject obviously breaks continuity (a different character or object, or a '
                                .'completely different art style); there is readable text or a watermark; the '
                                .'background is not a solid flat magenta; or, when a previous stage is attached, '
                                .'the subject clearly looks LESS advanced, healthy or grown than in it. Minor '
                                .'variations are fine — do not be strict. Reply with JSON: '
                                .'{"approved": true|false, "reason": "one short sentence"}.',
                        ],
                        ['role' => 'user', 'content' => $content],
                    ],
                ]);

            if (! $response->successful()) {
                $this->warn('Reviewer unavailable ('.$response->status().') — accepting this attempt.');

                return ['approved' => true, 'reason' => 'Reviewer unavailable.'];
            }

            /** @var array{approved?: bool, reason?: string}|null $verdict */
            $verdict = json_decode((string) $response->json('choices.0.message.content'), true);

            return [
                'approved' => (bool) ($verdict['approved'] ?? true),
                'reason' => Str::limit((string) ($verdict['reason'] ?? ''), 300),
            ];
        } catch (\Throwable $exception) {
            $this->warn('Reviewer failed ('.$exception->getMessage().') — accepting this attempt.');

            return ['approved' => true, 'reason' => 'Reviewer failed.'];
        }
    }

    /**
     * @return array{type: string, image_url: array{url: string}}
     */
    private function imageContent(string $bytes): array
    {
        return [
            'type' => 'image_url',
            'image_url' => ['url' => 'data:image/png;base64,'.base64_encode($bytes)],
        ];
    }

    /**
     * A prompt fragment collapsed into one generation-ready paragraph:
     * headings and the leading documentation paragraph are dropped.
     */
    private function promptFile(string $path): string
    {
        return collect(explode("\n\n", File::get(resource_path($path))))
            ->map(fn (string $block): string => trim(Str::squish($block)))
            ->filter(fn (string $block): bool => $block !== '' && ! str_starts_with($block, '#'))
            ->skip(1)
            ->implode(' ');
    }
}
