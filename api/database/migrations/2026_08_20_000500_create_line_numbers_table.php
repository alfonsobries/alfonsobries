<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('line_numbers', function (Blueprint $table) {
            $table->id();
            $table->string('provider_id')->unique();
            $table->string('e164');
            $table->string('display')->nullable();
            $table->string('status');
            $table->string('billing_period')->nullable();
            $table->timestamp('renews_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->boolean('ai_enabled')->default(false);
            $table->json('ai_config')->nullable();
            $table->json('on_off')->nullable();
            $table->json('usage')->nullable();
            $table->decimal('balance_usd', 10, 2)->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('line_numbers');
    }
};
