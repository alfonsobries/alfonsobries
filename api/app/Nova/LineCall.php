<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\LineCall as Model;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Fields\Badge;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource as NovaResource;

/**
 * @extends NovaResource<Model>
 */
final class LineCall extends NovaResource
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
        'id', 'provider_id',
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

            Badge::make('Status')->map([
                Model::STATUS_RINGING => 'warning',
                Model::STATUS_ANSWERED => 'info',
                Model::STATUS_COMPLETED => 'success',
                Model::STATUS_MISSED => 'danger',
                Model::STATUS_FAILED => 'danger',
            ]),

            DateTime::make('Started At')->sortable(),

            Number::make('Duration (s)', 'duration_sec'),

            Number::make('Cost USD', 'cost_usd')->step(0.0001)->onlyOnDetail(),

            Text::make('Recording Path', 'recording_path')->onlyOnDetail(),

            Text::make('Provider Id', 'provider_id')->onlyOnDetail(),
        ];
    }
}
