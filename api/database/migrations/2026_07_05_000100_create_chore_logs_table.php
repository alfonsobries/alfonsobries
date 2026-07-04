<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chore_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chore_id')->constrained();
            $table->string('family_member')->index();
            $table->date('date');
            $table->string('status');
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->unsignedTinyInteger('points');
            $table->timestamps();

            // One check per chore per day.
            $table->unique(['chore_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chore_logs');
    }
};
