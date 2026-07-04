<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\ChoreLog as Model;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Date;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;

/**
 * @extends NovaResource<Model>
 */
final class ChoreLog extends NovaResource
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
        'id', 'family_member',
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

            BelongsTo::make('Chore', 'chore', Chore::class)->sortable(),

            Text::make('Kid', 'family_member')->sortable(),

            Date::make('Date')->sortable(),

            Text::make('Status')->sortable(),

            BelongsTo::make('Reviewed by', 'reviewer', User::class)->nullable(),

            Number::make('Points'),
        ];
    }
}
