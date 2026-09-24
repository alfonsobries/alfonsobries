<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('paid_by', 20)->index();
            $table->foreignId('expense_category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payment_account_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('MXN');
            $table->string('description', 120);
            $table->string('merchant', 80)->nullable();
            $table->string('emoji', 16)->nullable();
            $table->text('note')->nullable();
            $table->timestamp('spent_at')->index();
            $table->string('source', 20)->default('chat');
            $table->foreignId('home_message_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('expense_home_message', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_message_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expense_id')->constrained()->cascadeOnDelete();
            $table->string('action', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_home_message');
        Schema::dropIfExists('expenses');
    }
};
