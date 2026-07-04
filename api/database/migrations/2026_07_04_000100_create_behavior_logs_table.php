<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('behavior_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('behavior_id')->constrained();
            $table->string('family_member')->index();
            $table->foreignId('user_id')->constrained();
            $table->unsignedTinyInteger('points');
            $table->boolean('affected_mood')->default(false);
            $table->string('mood_emoji')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('behavior_logs');
    }
};
