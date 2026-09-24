<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 20);
            $table->text('content')->nullable();
            $table->text('transcript')->nullable();
            $table->string('status', 20);
            $table->string('error')->nullable();
            $table->string('source', 20)->default('app');
            $table->string('client_key', 64)->nullable()->unique();
            $table->bigInteger('telegram_chat_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_messages');
    }
};
