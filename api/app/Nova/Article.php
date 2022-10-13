<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Article as Model;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Ardenthq\EnhancedMarkdown\EnhancedMarkdown;
use Ardenthq\EnhancedTextarea\EnhancedTextarea;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource;
use Laravel\Nova\Fields\Image;
use Illuminate\Http\Request;

final class Article extends Resource
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
        'id', 'title', 'body',
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

            EnhancedTextarea::make('Excerpt', 'excerpt')
                ->rules('nullable', 'string', 'required')
                ->hideFromIndex()
                ->maxLength(155),

            EnhancedTextarea::make('Meta description', 'meta_description')
                ->rules('nullable', 'string', 'max:155', 'required')
                ->hideFromIndex()
                ->maxLength(155),

            EnhancedMarkdown::make('Body')
                ->withFiles('public_s3', "/blog")
                ->rules('required', 'string')
                ->hideFromIndex(),

            Image::make('Banner', 'banner')
                ->rules('image')
                ->store(function ($request, $model) {
                    $model
                        ->addMedia($request->file('banner'))
                        ->toMediaCollection('banner');

                    return [];
                })
                ->delete(fn (Request $request, Model|null $model) => $model->getFirstMedia('banner')->delete())
                ->thumbnail(fn (mixed $value, string $disk, Model|null $model) => $model?->getFirstMediaUrl('banner', 'og'))
                ->preview(fn (mixed $value, string $disk, Model|null $model) => $model?->getFirstMediaUrl('banner', 'og'))
                ->disableDownload(),

            DateTime::make('Published at')
                ->sortable()
                ->nullable()
                ->help('Set a published date to publish the article'),
        ];
    }
}
