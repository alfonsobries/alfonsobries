<?php

declare(strict_types=1);

namespace App\Nova;

use Laravel\Nova\Resource;
use Laravel\Nova\Fields\ID;
use Illuminate\Http\Request;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Image;
use App\Models\Article as Model;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Textarea;
use Spatie\NovaTranslatable\Translatable;
use Laravel\Nova\Http\Requests\NovaRequest;
use Ardenthq\EnhancedMarkdown\EnhancedMarkdown;

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

            Text::make('URL', function ($model) {
                if ($model->isPublished()) {
                    return sprintf('<a class="link-default" target="_blank" href="%s">View</a>', $model->url());
                } else {
                    return sprintf('<a class="link-default" target="_blank" href="%s">Preview</a>', $model->previewUrl());
                }
            })->asHtml(),

            Translatable::make([
                Text::make('Title', 'title')
                    ->sortable()
                    ->rules('required', 'string', 'max:120'),

                Textarea::make('Excerpt', 'excerpt')
                    ->rules('nullable', 'string', 'required')
                    ->hideFromIndex()
                    ->maxLength(155),

                Textarea::make('Meta description', 'meta_description')
                    ->rules('nullable', 'string', 'max:155', 'required')
                    ->hideFromIndex()
                    ->maxLength(155),

                EnhancedMarkdown::make('Body')
                    ->disk('public_s3')
                    ->path('/blog')
                    ->rules('required', 'string'),
            ]),


            Image::make('Banner', 'banner')
                ->rules('image')
                ->store(function ($request, $model) {
                    $model
                        ->addMedia($request->file('banner'))
                        ->toMediaCollection('banner');

                    return [];
                })
                ->delete(fn (Request $request, Model|null $model) => $model->getFirstMedia('banner')->delete())
                ->thumbnail(fn (mixed $value, string $disk, Model|null $model) => $model?->getFirstMediaUrl('banner', 'thumbnail'))
                ->preview(fn (mixed $value, string $disk, Model|null $model) => $model?->getFirstMediaUrl('banner', 'og'))
                ->disableDownload(),

            DateTime::make('Published at')
                ->sortable()
                ->nullable()
                ->help('Set a published date to publish the article'),
        ];
    }
}
