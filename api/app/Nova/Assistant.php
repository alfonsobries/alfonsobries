<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Assistant as Model;
use App\Models\User;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MultiSelect;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Slug;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;

/**
 * @extends NovaResource<Model>
 */
final class Assistant extends NovaResource
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
        'id', 'name', 'slug',
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

            Text::make('Emoji')
                ->rules('nullable', 'string', 'max:8'),

            Text::make('Name')
                ->sortable()
                ->rules('required', 'string', 'max:60'),

            Slug::make('Slug')
                ->from('Name')
                ->rules('required', 'string', 'max:60')
                ->creationRules('unique:assistants,slug')
                ->updateRules('unique:assistants,slug,{{resourceId}}'),

            Text::make('Description')
                ->hideFromIndex()
                ->rules('nullable', 'string', 'max:255'),

            Textarea::make('Instructions')
                ->alwaysShow()
                ->rows(16)
                ->rules('required', 'string'),

            Text::make('Provider')
                ->hideFromIndex()
                ->placeholder(config('site.chat.provider'))
                ->rules('nullable', 'string', 'in:openai,anthropic,gemini'),

            Text::make('Model')
                ->hideFromIndex()
                ->placeholder(config('site.chat.model'))
                ->rules('nullable', 'string', 'max:60'),

            MultiSelect::make('Members')
                ->options(array_combine(User::MOOD_MEMBERS, array_map('ucfirst', User::MOOD_MEMBERS)))
                ->rules('required', 'array', 'min:1'),

            Boolean::make('Copyable output', 'copyable_output')
                ->help('Render replies with a prominent copy button (e.g. the translator).'),

            Number::make('Sort order', 'sort_order')
                ->default(0)
                ->sortable()
                ->rules('required', 'integer', 'between:0,255'),

            Boolean::make('Active', 'is_active')
                ->sortable(),
        ];
    }
}
