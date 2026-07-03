<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Article as Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Image;
use Laravel\Nova\Fields\Markdown;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;
use Spatie\NovaTranslatable\Translatable;

/**
 * @extends NovaResource<Model>
 */
final class Article extends NovaResource
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
     * @var array<int, string>
     */
    public static $search = [
        'id', 'title', 'body',
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

                Markdown::make('Body')
                    ->withFiles('public_s3', '/blog')
                    ->rules('required', 'string'),
            ]),

            Image::make('Banner', 'banner')
                ->rules('image')
                ->store(function ($request, $model) {
                    if ($model instanceof Model) {
                        $model
                            ->addMedia($request->file('banner'))
                            ->toMediaCollection('banner');
                    }

                    return [];
                })
                ->delete(fn (Request $request, ?Model $model) => $model->getFirstMedia('banner')->delete())
                ->thumbnail(fn (mixed $value, string $disk, ?Model $model) => $model?->getFirstMediaUrl('banner', 'thumbnail'))
                ->preview(fn (mixed $value, string $disk, ?Model $model) => $model?->getFirstMediaUrl('banner', 'og'))
                ->disableDownload(),

            DateTime::make('Published at')
                ->sortable()
                ->nullable()
                ->help('Set a published date to publish the article'),
        ];
    }
}
