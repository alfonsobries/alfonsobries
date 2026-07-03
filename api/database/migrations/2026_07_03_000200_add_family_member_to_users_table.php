<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Which family member a user represents (alfonso | saida | regina |
        // andres). The kids never sign in, but having a row lets us attribute
        // data to them. Null for anyone who isn't family (e.g. the admin).
        Schema::table('users', function (Blueprint $table) {
            $table->string('family_member')->nullable()->unique()->after('apple_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('family_member');
        });
    }
};
