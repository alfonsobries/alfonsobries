<?php

namespace App\Nova;

use Laravel\Nova\Resource as NovaResource;

/**
 * @template TModel of \Illuminate\Database\Eloquent\Model
 *
 * @extends NovaResource<TModel>
 */
abstract class Resource extends NovaResource {}
