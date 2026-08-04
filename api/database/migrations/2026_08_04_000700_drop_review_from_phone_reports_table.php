<?php

use App\Models\PhoneReport;
use App\Services\FamilyTimeBank;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A report is only made with dad's phone in the kid's hands, so there is
     * nothing left to review — pressing the button is the answer. Reports that
     * were still waiting on one get their minutes now.
     */
    public function up(): void
    {
        $now = now();

        $uncredited = DB::table('phone_reports')
            ->whereNotIn('id', function ($query) {
                $query->select('source_id')
                    ->from('family_time_entries')
                    ->where('source_type', PhoneReport::class)
                    ->whereNotNull('source_id');
            })
            ->pluck('id');

        foreach ($uncredited as $id) {
            DB::table('family_time_entries')->insert([
                'minutes' => FamilyTimeBank::MINUTES_PER_REPORT,
                'source_type' => PhoneReport::class,
                'source_id' => $id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        Schema::table('phone_reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn('status');
        });
    }

    public function down(): void
    {
        Schema::table('phone_reports', function (Blueprint $table) {
            $table->string('status')->default('confirmed');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }
};
