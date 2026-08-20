<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\LineMessage as Model;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Fields\Badge;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;

/**
 * @extends NovaResource<Model>
 */
final class LineMessage extends NovaResource
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
        'id', 'body', 'provider_id',
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

            BelongsTo::make('Contact', 'contact', LineContact::class)->sortable(),

            Badge::make('Direction')->map([
                Model::DIRECTION_IN => 'info',
                Model::DIRECTION_OUT => 'success',
            ]),

            Textarea::make('Body')->alwaysShow(),

            Badge::make('Status')->map([
                Model::STATUS_QUEUED => 'warning',
                Model::STATUS_SENT => 'info',
                Model::STATUS_DELIVERED => 'success',
                Model::STATUS_RECEIVED => 'success',
                Model::STATUS_FAILED => 'danger',
            ]),

            Number::make('Segments')->onlyOnDetail(),

            Number::make('Cost USD', 'cost_usd')->step(0.0001)->onlyOnDetail(),

            Text::make('Provider Id', 'provider_id')->onlyOnDetail(),

            DateTime::make('Sent At', 'provider_created_at')->sortable(),

            DateTime::make('Delivered At', 'delivered_at')->onlyOnDetail(),

            DateTime::make('Read At', 'read_at')->onlyOnDetail(),
        ];
    }
}
