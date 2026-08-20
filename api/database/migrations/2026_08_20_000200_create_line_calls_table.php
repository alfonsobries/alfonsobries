<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('line_calls', function (Blueprint $table) {
            $table->id();
            $table->string('provider_id')->unique();
            $table->foreignId('line_contact_id')->constrained()->cascadeOnDelete();
            $table->string('direction');
            $table->string('status')->index();
            $table->string('answered_by')->nullable();
            $table->timestamp('started_at')->index();
            $table->timestamp('answered_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('duration_sec')->default(0);
            $table->string('recording_path')->nullable();
            $table->decimal('cost_usd', 8, 4)->nullable();
            $table->timestamp('seen_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('line_calls');
    }
};
