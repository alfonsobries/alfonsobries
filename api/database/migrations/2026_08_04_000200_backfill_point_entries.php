<?php

use App\Models\ChoreLog;
use App\Models\Reward;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Turn the balances that used to be derived on the fly into ledger rows,
     * then hand each kid's remaining points to the goal their progress bar
     * was already pointing at.
     */
    public function up(): void
    {
        $now = now();

        $approved = DB::table('chore_logs')
            ->where('status', ChoreLog::STATUS_APPROVED)
            ->get(['id', 'family_member', 'points']);

        foreach ($approved as $log) {
            DB::table('point_entries')->insert([
                'family_member' => $log->family_member,
                'delta' => $log->points,
                'reason' => null,
                'reward_id' => null,
                'source_type' => ChoreLog::class,
                'source_id' => $log->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $redeemed = DB::table('rewards')
            ->whereNotNull('achieved_at')
            ->get(['id', 'family_member', 'cost']);

        foreach ($redeemed as $reward) {
            DB::table('point_entries')->insert([
                'family_member' => $reward->family_member,
                'delta' => -$reward->cost,
                'reason' => null,
                'reward_id' => null,
                'source_type' => Reward::class,
                'source_id' => $reward->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $members = DB::table('point_entries')->distinct()->pluck('family_member');

        foreach ($members as $member) {
            $goal = DB::table('rewards')
                ->where('family_member', $member)
                ->whereNull('achieved_at')
                ->whereNull('deleted_at')
                ->orderBy('id')
                ->first(['id']);

            if ($goal === null) {
                continue;
            }

            DB::table('rewards')->where('id', $goal->id)->update(['is_active' => true]);

            $balance = (int) DB::table('point_entries')->where('family_member', $member)->sum('delta');

            if ($balance <= 0) {
                continue;
            }

            DB::table('point_entries')->insert([
                [
                    'family_member' => $member,
                    'delta' => -$balance,
                    'reason' => 'carry-over',
                    'reward_id' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'family_member' => $member,
                    'delta' => $balance,
                    'reason' => 'carry-over',
                    'reward_id' => $goal->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }
    }

    public function down(): void
    {
        DB::table('point_entries')->truncate();
        DB::table('rewards')->update(['is_active' => false]);
    }
};
