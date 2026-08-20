<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('line_messages', function (Blueprint $table) {
            $table->id();
            $table->string('provider_id')->nullable()->unique();
            $table->string('client_key')->nullable()->unique();
            $table->foreignId('line_contact_id')->constrained()->cascadeOnDelete();
            $table->string('direction');
            $table->text('body');
            $table->json('media_urls')->nullable();
            $table->json('media_paths')->nullable();
            $table->unsignedSmallInteger('segments')->default(1);
            $table->string('status')->index();
            $table->string('failure_code')->nullable();
            $table->decimal('cost_usd', 8, 4)->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('provider_created_at')->index();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['line_contact_id', 'provider_created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('line_messages');
    }
};
