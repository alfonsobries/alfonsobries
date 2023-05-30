<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Project as Model;
use Ardenthq\EnhancedMarkdown\EnhancedMarkdown;
use Illuminate\Http\Request;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Image;
use Laravel\Nova\Fields\MultiSelect;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource;
use Outl1ne\NovaSortable\Traits\HasSortableRows;
use Spatie\NovaTranslatable\Translatable;

final class Project extends Resource
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

            Translatable::make([
                Text::make('Title', 'title')
                    ->sortable()
                    ->rules('required', 'string', 'max:120'),

                EnhancedMarkdown::make('Description', 'description')
                    ->disk('public_s3')
                    ->path('/project')
                    ->rules('nullable', 'string'),
            ]),

            Text::make('Url', 'url')
                ->rules('required', 'url')
                ->placeholder('https://vue-tailwind.com'),

            Image::make('Banner', 'banner')
                ->rules('image')
                ->store(function ($request, $model) {
                    $model
                        ->addMedia($request->file('banner'))
                        ->toMediaCollection('banner');

                    return [];
                })
                ->delete(fn (Request $request, Model|null $model) => $model->getFirstMedia('banner')->delete())
                ->thumbnail(fn (mixed $value, string $disk, Model|null $model) => $model?->getFirstMediaUrl('banner', '1x'))
                ->preview(fn (mixed $value, string $disk, Model|null $model) => $model?->getFirstMediaUrl('banner', '1x'))
                ->help(sprintf('Try to use a banner that is at least %spx wide and %spx tall.', Model::BANNER_WIDTH * 2, Model::BANNER_HEIGHT * 2)),

            MultiSelect::make('Technologies', 'technologies')
                ->options(collect(Model::TECHNOLOGIES)->map(fn ($value) => ['value' => $value, 'label' => $value]))
                ->sortable(),

            Boolean::make('Published', 'is_published'),
        ];
    }
}
