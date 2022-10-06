<?php

namespace App\Models;

use App\Models\Traits\ExpiresFrontend;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

class ResumeExperience extends Model implements Sortable
{
    use HasFactory;
    use SortableTrait;
    use SoftDeletes;
    use ExpiresFrontend;

    protected $table = 'resume_experience';

    public $sortable = [
        'order_column_name' => 'sort_order',
        'sort_when_creating' => true,
    ];
}
