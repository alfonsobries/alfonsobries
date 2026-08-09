<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_entries', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('exercise');
            $table->unsignedTinyInteger('sets');
            $table->timestamp('completed_at');
            $table->timestamps();

            $table->unique(['date', 'exercise']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_entries');
    }
};
