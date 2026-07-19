<?php

namespace App\Console\Commands;

use App\Exceptions\Images\ImageProviderException;
use App\Images\ImageManager;
use App\Services\IllustrationProcessor;
use Illuminate\Console\Command;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class IllustrateMoods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'illustrate:moods
        {member=all : regina, andres or all}
        {--emotion=* : Generate only these emotion keys; may be repeated}
        {--attempts=3 : Generation attempts per portrait before keeping the last one}
        {--force : Replace portraits that already exist}
        {--dir= : Base output directory; defaults to ../app/assets}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Regina and Andrés emotion-catalog portraits from their canonical references';

    private const IMAGE_OPTIONS = ['model' => 'gpt-image-2', 'quality' => 'low'];

    private const REVIEWER_MODEL = 'gpt-5-mini';

    public function handle(ImageManager $images, IllustrationProcessor $processor): int
    {
        /** @var array{members: array<string, array{name: string, reference: string, avatar: string}>, emotions: array<string, array{label: string, prompt: string}>} $catalog */
        $catalog = require resource_path('illustrations/mood-catalog.php');

        $members = $this->selectedMembers((string) $this->argument('member'), $catalog['members']);

        if ($members === null) {
            return self::FAILURE;
        }

        $emotions = $this->selectedEmotions((array) $this->option('emotion'), $catalog['emotions']);

        if ($emotions === null) {
            return self::FAILURE;
        }

        $attempts = max(1, (int) $this->option('attempts'));
        $baseDirectory = (string) ($this->option('dir') ?: base_path('../app/assets'));
        $provider = $images->provider('openai');

        foreach ($members as $member => $identity) {
            $stylePath = resource_path($identity['reference']);
            $avatarPath = base_path($identity['avatar']);

            if (! File::exists($stylePath) || ! File::exists($avatarPath)) {
                $this->error("Missing canonical reference for {$identity['name']}.");

                return self::FAILURE;
            }

            $references = [File::get($stylePath), File::get($avatarPath)];
            $directory = "{$baseDirectory}/{$member}/emotions";
            File::ensureDirectoryExists($directory);

            foreach ($emotions as $key => $emotion) {
                $target = "{$directory}/{$key}.png";

                if (File::exists($target) && ! $this->option('force')) {
                    $this->line("[{$identity['name']}] {$emotion['label']}: already exists, skipping.");

                    continue;
                }

                $this->info("[{$identity['name']}] {$emotion['label']}: generating…");
                $raw = null;
                $verdict = ['approved' => false, 'reason' => ''];

                foreach (range(1, $attempts) as $attempt) {
                    try {
                        $raw = $provider->generate(
                            $this->composePrompt($identity['name'], $emotion, $verdict['reason']),
                            $references,
                            self::IMAGE_OPTIONS,
                        );
                    } catch (ImageProviderException $exception) {
                        $this->warn("Attempt {$attempt} errored: {$exception->getMessage()}");

                        continue;
                    }

                    $verdict = $this->review($identity['name'], $emotion, $references[1], $raw);

                    if ($verdict['approved']) {
                        break;
                    }

                    $this->warn("Attempt {$attempt} rejected: {$verdict['reason']}");
                }

                if ($raw === null) {
                    $this->error("Could not generate {$identity['name']}'s {$emotion['label']} portrait. Re-run the command to resume.");

                    return self::FAILURE;
                }

                if (! $verdict['approved']) {
                    $this->warn('No attempt was approved; keeping the last generation.');
                }

                $final = $processor->padToAspect($processor->chromaKeyToTransparent($raw), 1, 1);
                File::put($target, $final);

                $this->info("Saved {$target}. {$verdict['reason']}");
            }
        }

        $this->info('Emotion catalog generation complete.');

        return self::SUCCESS;
    }

    /**
     * @param  array<string, array{name: string, reference: string, avatar: string}>  $available
     * @return array<string, array{name: string, reference: string, avatar: string}>|null
     */
    private function selectedMembers(string $requested, array $available): ?array
    {
        if ($requested === 'all') {
            return $available;
        }

        if (! isset($available[$requested])) {
            $this->error('Unknown member. Use regina, andres or all.');

            return null;
        }

        return [$requested => $available[$requested]];
    }

    /**
     * @param  list<string>  $requested
     * @param  array<string, array{label: string, prompt: string}>  $available
     * @return array<string, array{label: string, prompt: string}>|null
     */
    private function selectedEmotions(array $requested, array $available): ?array
    {
        if ($requested === []) {
            return $available;
        }

        $unknown = array_values(array_diff($requested, array_keys($available)));

        if ($unknown !== []) {
            $this->error('Unknown emotion: '.implode(', ', $unknown).'.');

            return null;
        }

        return array_intersect_key($available, array_flip($requested));
    }

    /**
     * @param  array{label: string, prompt: string}  $emotion
     */
    private function composePrompt(string $name, array $emotion, string $feedback): string
    {
        $parts = [
            'The FIRST attached image is the canonical character and illustration style sheet. The SECOND attached image is the existing app avatar and is the exact identity, face, hair, outfit and close portrait anchor. Follow both references strictly.',
            $this->promptFile('illustrations/style-base.md'),
            "Draw exactly one close-up emotion portrait of {$name}, matching the same child in the references. Head and upper torso only, front or very slight three-quarter view, centered in a square canvas. The head and face must be large and instantly readable in a small mobile-app catalog tile. Preserve the child's exact age, facial proportions, hairstyle, hair color, skin treatment, garment color and signature garment design. Change only the facial expression and the small upper-body gesture needed to communicate the emotion. No other people, no scene, no furniture, no toys, no props, no words, no labels, no border and no cropped-off head.",
            $this->promptFile('illustrations/background-chroma.md'),
            "Emotion: {$emotion['label']}. {$emotion['prompt']}",
        ];

        if ($feedback !== '') {
            $parts[] = 'A reviewer rejected the previous attempt. Correct this issue while keeping every other instruction unchanged: '.$feedback;
        }

        return implode(' ', $parts);
    }

    /**
     * @param  array{label: string, prompt: string}  $emotion
     * @return array{approved: bool, reason: string}
     */
    private function review(string $name, array $emotion, string $avatar, string $candidate): array
    {
        try {
            $response = Http::withToken((string) config('images.providers.openai.api_key'))
                ->timeout(120)
                ->post(rtrim((string) config('images.providers.openai.base_url'), '/').'/chat/completions', [
                    'model' => self::REVIEWER_MODEL,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Review a child-friendly illustrated emotion portrait. The FIRST image is the canonical identity and crop reference; the LAST is the candidate. Reject only when the candidate clearly depicts a different child, the requested emotion is not recognizable, the face is too small or obscured, the head is cropped, there are extra people/props/text, the drawing is scary or shaming, or the background is not solid flat magenta. Small hand-drawn variations are acceptable. Reply as JSON: {"approved": true|false, "reason": "one short sentence"}.',
                        ],
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => "Character: {$name}. Emotion: {$emotion['label']}. {$emotion['prompt']}",
                                ],
                                $this->imageContent($avatar),
                                $this->imageContent($candidate),
                            ],
                        ],
                    ],
                ])
                ->throw();

            /** @var array{approved?: bool, reason?: string}|null $verdict */
            $verdict = json_decode((string) $response->json('choices.0.message.content'), true);

            return [
                'approved' => (bool) ($verdict['approved'] ?? true),
                'reason' => Str::limit((string) ($verdict['reason'] ?? ''), 300),
            ];
        } catch (RequestException $exception) {
            $this->warn("Reviewer unavailable ({$exception->response->status()}); accepting this attempt.");

            return ['approved' => true, 'reason' => 'Reviewer unavailable.'];
        } catch (\Throwable $exception) {
            $this->warn("Reviewer failed ({$exception->getMessage()}); accepting this attempt.");

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
     * Collapse a prompt resource into a generation-ready paragraph, dropping
     * its heading and human-facing documentation paragraph.
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
