<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Reward as Model;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Date;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Image;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;

/**
 * @extends NovaResource<Model>
 */
final class Reward extends NovaResource
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
    public static $title = 'name';

    /**
     * The columns that should be searched.
     *
     * @var array<int, string>
     */
    public static $search = [
        'id', 'name', 'family_member',
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

            Select::make('Kid', 'family_member')
                ->options(array_combine(User::KID_MEMBERS, array_map('ucfirst', User::KID_MEMBERS)))
                ->displayUsingLabels()
                ->sortable()
                ->rules('required'),

            Text::make('Name')
                ->sortable()
                ->rules('required', 'string', 'max:60'),

            Number::make('Cost')
                ->min(1)
                ->max(999)
                ->sortable()
                ->rules('required', 'integer', 'between:1,999'),

            Date::make('Available on', 'available_on')
                ->nullable()
                ->sortable(),

            Boolean::make('Needs content parents', 'requires_content_parents'),

            Image::make('Illustration', 'illustration')
                ->rules('image')
                ->store(function ($request, $model) {
                    if ($model instanceof Model) {
                        $model
                            ->addMedia($request->file('illustration'))
                            ->toMediaCollection('illustration');
                    }

                    return [];
                })
                ->delete(fn (Request $request, ?Model $model) => $model?->getFirstMedia('illustration')?->delete())
                ->thumbnail(fn (mixed $value, string $disk, ?Model $model) => $model?->getFirstMediaUrl('illustration', 'tile'))
                ->preview(fn (mixed $value, string $disk, ?Model $model) => $model?->getFirstMediaUrl('illustration', 'tile'))
                ->disableDownload(),

            DateTime::make('Achieved at')
                ->nullable()
                ->sortable(),
        ];
    }
}
