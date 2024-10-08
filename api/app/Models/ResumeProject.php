<?php

namespace App\Models;

use App\Models\Traits\ExpiresFrontend;
use App\Models\Traits\ExpiresResume;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

class ResumeProject extends Model implements Sortable
{
    use HasFactory;
    use SortableTrait;
    use SoftDeletes;
    use ExpiresFrontend;
    use ExpiresResume;

    public $sortable = [
        'order_column_name' => 'sort_order',
        'sort_when_creating' => true,
    ];
}
