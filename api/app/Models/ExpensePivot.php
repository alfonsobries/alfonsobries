<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * What a home chat answer did to an expense: created, updated or deleted it.
 *
 * @property string $action
 */
class ExpensePivot extends Pivot
{
    protected $table = 'expense_home_message';

    public $incrementing = true;
}
