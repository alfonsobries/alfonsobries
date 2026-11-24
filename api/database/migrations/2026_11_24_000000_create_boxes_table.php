<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boxes', function (Blueprint $table): void {
            $table->id();
            // Printed into the box's QR label, so it never changes.
            $table->string('token', 16)->unique();
            $table->string('name', 60);
            $table->string('location', 60)->nullable();
            $table->timestamps();
        });

        Schema::create('box_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('box_id')->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->string('notes', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('box_items');
        Schema::dropIfExists('boxes');
    }
};
