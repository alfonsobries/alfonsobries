<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Project as Model;
use Laravel\Nova\Fields\ID;
use Ardenthq\EnhancedMarkdown\EnhancedMarkdown;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource;
use Laravel\Nova\Fields\Image;
use Illuminate\Http\Request;
use Laravel\Nova\Fields\MultiSelect;
use Outl1ne\NovaSortable\Traits\HasSortableRows;

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

            Text::make('Title', 'title')
                ->sortable()
                ->rules('required', 'string', 'max:120'),

            EnhancedMarkdown::make('Description', 'description')
                ->rules('nullable', 'string'),

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
                ->disableDownload(),

            MultiSelect::make('Technologies', 'technologies')
                ->options(collect(Model::TECHNOLOGIES)->map(fn ($value) => ['value' => $value, 'label' => $value]))
                ->sortable(),

        ];
    }
}
