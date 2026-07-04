<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->string('family_member')->index();
            $table->string('name');
            $table->unsignedSmallInteger('cost');
            $table->date('available_on')->nullable();
            $table->boolean('requires_content_parents')->default(true);
            $table->timestamp('achieved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rewards');
    }
};
