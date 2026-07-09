<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('virtue_days', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->timestamp('prayers_completed_at')->nullable();
            $table->string('resolution')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('virtue_days');
    }
};
