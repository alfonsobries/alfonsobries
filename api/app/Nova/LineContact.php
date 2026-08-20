<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\LineContact as Model;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;

/**
 * @extends NovaResource<Model>
 */
final class LineContact extends NovaResource
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
    public static $title = 'e164';

    /**
     * The columns that should be searched.
     *
     * @var array<int, string>
     */
    public static $search = [
        'id', 'e164', 'name',
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

            Text::make('Number', 'e164')
                ->sortable()
                ->rules('required', 'string'),

            Text::make('Name')
                ->sortable()
                ->rules('nullable', 'string', 'max:100'),

            Textarea::make('Notes')
                ->rules('nullable', 'string', 'max:2000'),

            Boolean::make('Blocked')->sortable(),

            Boolean::make('Favorite')->sortable(),

            HasMany::make('Messages', 'messages', LineMessage::class),

            HasMany::make('Calls', 'calls', LineCall::class),

            HasMany::make('Voicemails', 'voicemails', LineVoicemail::class),
        ];
    }
}
