<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\LineVoicemail as Model;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;

/**
 * @extends NovaResource<Model>
 */
final class LineVoicemail extends NovaResource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static $model = Model::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'id';

    /**
     * The columns that should be searched.
     *
     * @var array<int, string>
     */
    public static $search = [
        'id', 'transcript', 'provider_id',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field|MergeValue>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            BelongsTo::make('Contact', 'contact', LineContact::class)->sortable(),

            BelongsTo::make('Call', 'call', LineCall::class)->nullable(),

            Textarea::make('Transcript')->alwaysShow(),

            Textarea::make('Summary')->onlyOnDetail(),

            Text::make('Sentiment')->onlyOnDetail(),

            Number::make('Duration (s)', 'duration_sec'),

            Text::make('Audio Path', 'audio_path')->onlyOnDetail(),

            DateTime::make('Received At')->sortable(),

            DateTime::make('Heard At')->onlyOnDetail(),
        ];
    }
}
