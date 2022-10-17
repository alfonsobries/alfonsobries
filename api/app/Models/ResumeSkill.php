<?php

namespace App\Models;

use App\Models\Traits\ExpiresFrontend;
use App\Models\Traits\ExpiresResume;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

class ResumeSkill extends Model implements Sortable
{
    use HasFactory;
    use SortableTrait;
    use SoftDeletes;
    use ExpiresFrontend;
    use ExpiresResume;

    const LEVEL_EXPERT = 'expert';

    const LEVEL_ADVANCED = 'advanced';

    const CATEGORY_FRAMEWORK = 'framework';

    const CATEGORY_LANGUAGE = 'language';

    const CATEGORY_OTHER = 'other';

    public $sortable = [
        'order_column_name' => 'sort_order',
        'sort_when_creating' => true,
    ];
}
