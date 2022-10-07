<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\ContactFormMessage as Model;
use Laravel\Nova\Fields\ID;
use Ardenthq\EnhancedMarkdown\EnhancedMarkdown;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource;

final class ContactFormMessage extends Resource
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

            Text::make('Name', 'name')
                ->sortable()
                ->rules('string'),

            Text::make('Email', 'email')
                ->sortable()
                ->rules('string', 'email'),

            Textarea::make('Message', 'message')
                ->rules('nullable', 'string'),

            DateTime::make('Created at')
                ->sortable()
                ->nullable(),
        ];
    }
}
