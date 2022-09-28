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
// use Laravel\Nova\Fields\Image;

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
        // /** @var Model */
        // $resource = $this->resource;

        return [
            ID::make()->sortable(),

            Text::make('Title', 'title')
                ->sortable()
                ->rules('required', 'string', 'max:120'),

            EnhancedTextarea::make('Meta description', 'meta_description')
                ->rules('nullable', 'string', 'max:155')
                ->hideFromIndex()
                ->maxLength(155),

            EnhancedMarkdown::make('Body')
                ->withFiles('public')
                ->rules('required', 'string')
                ->hideFromIndex(),

            // Image::make('Banner', 'banner')
            //     ->rules('image', 'max:2048')
            //     ->store(function ($request, $model) {
            //         $model
            //             ->addMedia($request->file('banner'))
            //             ->toMediaCollection('banner');

            //         return [];
            //     })
            //     ->deletable(false)
            //     ->thumbnail(function () use ($resource) {
            //         /** @var Article $resource */
            //         return $resource->getFirstMediaUrl('banner');
            //     })
            //     ->preview(function () use ($resource) {
            //         info($resource->getFirstMediaUrl('banner'));
            //         /** @var Article $resource */
            //         return $resource->getFirstMediaUrl('banner');
            //     })
            //     ->disableDownload(),

            DateTime::make('Published at')
                ->sortable()
                ->nullable()
                ->help('Set a published date to publish the article'),
        ];
    }

    // protected static function afterValidation(NovaRequest $request, $validator) : void
    // {
    //     /** @var Model|null $model */
    //     $model = $request->findModel();

    //     if ($model?->getFirstMedia('banner') !== null) {
    //         return;
    //     }

    //     if ($request->input('published_at') === null) {
    //         return;
    //     }

    //     if ($request->has('banner')) {
    //         return;
    //     }

    //     $validator->errors()->add('banner', 'The banner is required when the article is set to be published');
    // }
}
