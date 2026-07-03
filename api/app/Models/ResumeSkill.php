<?php

namespace App\Models;

use App\Models\Traits\ExpiresFrontend;
use App\Models\Traits\ExpiresResume;
use Database\Factories\ResumeSkillFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

class ResumeSkill extends Model implements Sortable
{
    use ExpiresFrontend;

    use ExpiresResume;
    /** @use HasFactory<ResumeSkillFactory> */
    use HasFactory;
    use SoftDeletes;
    use SortableTrait;

    const LEVEL_EXPERT = 'expert';

    const LEVEL_ADVANCED = 'advanced';

    const CATEGORY_FRAMEWORK = 'framework';

    const CATEGORY_LANGUAGE = 'language';

    const CATEGORY_OTHER = 'other';

    /**
     * @var array<string, mixed>
     */
    public $sortable = [
        'order_column_name' => 'sort_order',
        'sort_when_creating' => true,
    ];
}
