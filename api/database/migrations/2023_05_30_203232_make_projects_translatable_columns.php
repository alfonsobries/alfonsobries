<?php

use App\Models\Project;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $translatableColumns = [
        'title',
        'description',
    ];
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // 1. Make it text so we can store the whole text
        Schema::table('projects', function (Blueprint $table) {
            collect($this->translatableColumns)->each(function ($columnName) use ($table) {
                $table->text($columnName)->change();
            });
        });

        // 2. Convert the columns to JSON
        Project::withTrashed()->update(
            collect($this->translatableColumns)
                ->mapWithKeys(function ($columnName) {
                    return [$columnName => DB::raw(sprintf("JSON_OBJECT('en', %s, 'es', %s)", $columnName, $columnName))];
                })
                ->toArray()
        );

        // 3. Make it JSON
        Schema::table('projects', function (Blueprint $table) {
            collect($this->translatableColumns)->each(function ($columnName) use ($table) {
                $table->json($columnName)->change();
            });
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // 1. Make it text so we can store the whole text
        Schema::table('projects', function (Blueprint $table) {
            collect($this->translatableColumns)->each(function ($columnName) use ($table) {
                $table->text($columnName)->change();
            });
        });

        // 2. Store the English version in the column
        Project::withTrashed()->update(
            collect($this->translatableColumns)
                ->mapWithKeys(function ($columnName) {
                    return [$columnName => DB::raw(sprintf("JSON_UNQUOTE(JSON_EXTRACT(%s, '$.en'))", $columnName))];
                })
                ->toArray()

        );

        // 3. Make it the original type again
        Schema::table('projects', function (Blueprint $table) {
            $table->string('title')->change();
            $table->text('description')->change();
        });
    }
};
