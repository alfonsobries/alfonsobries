<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\ResumeProject as Model;
use Ardenthq\EnhancedMarkdown\EnhancedMarkdown;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource;
use Outl1ne\NovaSortable\Traits\HasSortableRows;

final class ResumeProject extends Resource
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

            Text::make('Title', 'title')
                ->sortable()
                ->rules('required', 'string')
                ->placeholder('Vue-Tailwind'),

            Text::make('Url', 'url')
                ->rules('required', 'url')
                ->placeholder('https://vue-tailwind.com'),

            EnhancedMarkdown::make('Description')
                ->disk('public_s3')
                ->path('/resume_project')
                ->rules('required', 'string')
                ->hideFromIndex(),
        ];
    }
}
