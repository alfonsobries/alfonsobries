<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Experience as Model;
use Laravel\Nova\Fields\ID;
use Ardenthq\EnhancedMarkdown\EnhancedMarkdown;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource;
use Laravel\Nova\Fields\Select;
use Outl1ne\NovaSortable\Traits\HasSortableRows;

final class Experience extends Resource
{
    use HasSortableRows;

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
    public static $title = 'title';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id', 'title', 'description',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array
     */
    public function fields(NovaRequest $request)
    {
        return [
            ID::make()->sortable(),

            Select::make('Type', 'type')
                ->options([
                    'work' => 'Work',
                    'education' => 'Education',
                ])
                ->displayUsingLabels()
                ->rules('required'),

            Text::make('Title', 'title')
                ->sortable()
                ->rules('required', 'string')
                ->placeholder('Ark Ecosystem - Fullstack Developer'),

            Text::make('Period', 'period')
                ->sortable()
                ->rules('required', 'string')
                ->placeholder('Feb 2009 - Dic 2019 (~10 years)'),

            Text::make('Place', 'place')
                ->sortable()
                ->rules('required', 'string')
                ->placeholder('Remote'),

            EnhancedMarkdown::make('Description')
                ->withFiles('public')
                ->rules('required', 'string')
                ->hideFromIndex(),
        ];
    }
}
