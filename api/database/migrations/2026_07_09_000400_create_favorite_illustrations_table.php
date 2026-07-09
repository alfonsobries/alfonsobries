<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorite_illustrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chat_message_id')->nullable()->constrained()->nullOnDelete();
            $table->string('prompt')->nullable();
            $table->json('members')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'chat_message_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorite_illustrations');
    }
};
