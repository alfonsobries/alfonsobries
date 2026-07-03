<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\ResumeProject as Model;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Markdown;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;
use Outl1ne\NovaSortable\Traits\HasSortableRows;

/**
 * @extends NovaResource<Model>
 */
final class ResumeProject extends NovaResource
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
     * @var array<int, string>
     */
    public static $search = [
        'id', 'title', 'description',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
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

            Markdown::make('Description')
                ->withFiles('public_s3', '/resume_project')
                ->rules('required', 'string')
                ->hideFromIndex(),
        ];
    }
}
