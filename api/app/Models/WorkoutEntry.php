<?php

namespace App\Models;

use App\Workout\WorkoutExercise;
use Database\Factories\WorkoutEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * The sets completed for one exercise on one day. Clearing an exercise
 * deletes the row, so a day with no rows is simply pending.
 */
class WorkoutEntry extends Model
{
    /** @use HasFactory<WorkoutEntryFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'date',
        'exercise',
        'sets',
        'completed_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'exercise' => WorkoutExercise::class,
        'sets' => 'integer',
        'completed_at' => 'datetime',
    ];
}
