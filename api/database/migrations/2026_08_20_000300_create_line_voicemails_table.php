<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('line_voicemails', function (Blueprint $table) {
            $table->id();
            $table->string('provider_id')->unique();
            $table->foreignId('line_call_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('line_contact_id')->constrained()->cascadeOnDelete();
            $table->string('audio_path')->nullable();
            $table->text('transcript')->nullable();
            $table->text('translation')->nullable();
            $table->text('summary')->nullable();
            $table->string('sentiment')->nullable();
            $table->unsignedInteger('duration_sec')->nullable();
            $table->timestamp('received_at')->index();
            $table->timestamp('heard_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('line_voicemails');
    }
};
