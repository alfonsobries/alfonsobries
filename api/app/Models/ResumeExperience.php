<?php

namespace App\Models;

use App\Models\Traits\ExpiresFrontend;
use App\Models\Traits\ExpiresResume;
use Database\Factories\ResumeExperienceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

class ResumeExperience extends Model implements Sortable
{
    use ExpiresFrontend;

    use ExpiresResume;
    /** @use HasFactory<ResumeExperienceFactory> */
    use HasFactory;
    use SoftDeletes;
    use SortableTrait;

    const TYPE_WORK = 'work';

    const TYPE_EDUCATION = 'education';

    protected $table = 'resume_experience';

    /**
     * @var array<string, mixed>
     */
    public $sortable = [
        'order_column_name' => 'sort_order',
        'sort_when_creating' => true,
    ];
}
