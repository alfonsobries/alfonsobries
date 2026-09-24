<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->bigInteger('telegram_chat_id')->nullable()->unique();
            $table->string('telegram_username')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['telegram_chat_id']);
            $table->dropColumn(['telegram_chat_id', 'telegram_username']);
        });
    }
};
