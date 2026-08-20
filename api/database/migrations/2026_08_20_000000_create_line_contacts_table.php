<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('line_contacts', function (Blueprint $table) {
            $table->id();
            $table->string('e164')->unique();
            $table->string('name')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('blocked')->default(false);
            $table->boolean('favorite')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('line_contacts');
    }
};
