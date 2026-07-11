<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('virtue_entries', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('habit');
            $table->timestamp('completed_at');
            $table->timestamps();

            $table->unique(['date', 'habit']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('virtue_entries');
    }
};
