<?php

use App\Models\SupportBrand;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_availabilities', function (Blueprint $table) {
            $table->id();
            $table->string('timezone');
            $table->json('weekly');
            $table->string('outside_hours_mode');
            $table->string('override_mode')->nullable();
            $table->timestamp('override_until')->nullable();
            $table->unsignedInteger('version')->default(0);
            $table->timestamps();
        });

        Schema::create('support_availability_exceptions', function (Blueprint $table) {
            $table->id();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->index();
            $table->string('mode');
            $table->string('label')->nullable();
            $table->timestamps();
        });

        Schema::create('support_brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->string('base_url')->nullable();
            $table->text('secret')->nullable();
            $table->boolean('enabled')->default(false);
            $table->timestamp('last_pushed_at')->nullable();
            $table->unsignedInteger('last_pushed_version')->nullable();
            $table->string('last_push_status')->nullable();
            $table->string('last_push_message')->nullable();
            $table->string('reported_mode')->nullable();
            $table->timestamp('last_pulled_at')->nullable();
            $table->timestamps();
        });

        SupportBrand::syncFromConfig();
    }

    public function down(): void
    {
        Schema::dropIfExists('support_brands');
        Schema::dropIfExists('support_availability_exceptions');
        Schema::dropIfExists('support_availabilities');
    }
};
