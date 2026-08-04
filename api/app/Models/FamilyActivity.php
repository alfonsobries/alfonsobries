<?php

namespace App\Models;

use App\Models\Concerns\HasIllustration;
use Database\Factories\FamilyActivityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;

/**
 * Something the family does together, priced in minutes from the time bank.
 */
class FamilyActivity extends Model implements HasMedia
{
    /** @use HasFactory<FamilyActivityFactory> */
    use HasFactory;

    use HasIllustration;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'cost_minutes',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'cost_minutes' => 'integer',
    ];
}
