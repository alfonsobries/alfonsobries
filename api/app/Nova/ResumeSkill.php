<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\ResumeSkill as Model;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;
use Outl1ne\NovaSortable\Traits\HasSortableRows;

/**
 * @extends NovaResource<Model>
 */
final class ResumeSkill extends NovaResource
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
    public static $title = 'name';

    /**
     * The columns that should be searched.
     *
     * @var array<int, string>
     */
    public static $search = [
        'id', 'name', 'category',
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

            Select::make('Category', 'category')
                ->options([
                    Model::CATEGORY_FRAMEWORK => 'Framework & Tools',
                    Model::CATEGORY_LANGUAGE => 'Programming Languages',
                    Model::CATEGORY_OTHER => 'Other Techs & Methodologies',
                ])
                ->sortable()
                ->displayUsingLabels()
                ->rules('required'),

            Text::make('Name', 'name')
                ->sortable()
                ->rules('required', 'string')
                ->placeholder('Laravel'),

            Select::make('Level', 'level')
                ->options([
                    Model::LEVEL_EXPERT => 'Expert',
                    Model::LEVEL_ADVANCED => 'Strong Knowledge',
                ])
                ->sortable()
                ->displayUsingLabels()
                ->rules('required'),
        ];
    }
}
