<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('virtue_entries', function (Blueprint $table) {
            $table->unsignedSmallInteger('minutes')->nullable()->after('habit');
        });
    }

    public function down(): void
    {
        Schema::table('virtue_entries', function (Blueprint $table) {
            $table->dropColumn('minutes');
        });
    }
};
