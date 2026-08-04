<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phone_reports', function (Blueprint $table) {
            $table->id();
            $table->string('family_member')->index();
            $table->date('date');
            $table->string('status');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // One a day each, so reporting stays a signal instead of a game.
            $table->unique(['family_member', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_reports');
    }
};
