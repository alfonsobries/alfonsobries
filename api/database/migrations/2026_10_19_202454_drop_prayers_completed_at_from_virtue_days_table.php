<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('virtue_days', function (Blueprint $table) {
            $table->dropColumn('prayers_completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('virtue_days', function (Blueprint $table) {
            $table->timestamp('prayers_completed_at')->nullable();
        });
    }
};
