<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 40);
            $table->string('emoji', 16);
            $table->string('kind', 20);
            $table->string('last4', 4)->nullable();
            // A family member key, or null for an account both of them use.
            $table->string('owner', 20)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_accounts');
    }
};
