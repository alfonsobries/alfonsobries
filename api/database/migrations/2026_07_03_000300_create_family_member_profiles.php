<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Ensure every family member has a user row. Parents are matched by their
     * Apple sub (their login identity) so we attach to their real account;
     * the kids never log in, so they're matched by their role. Idempotent.
     */
    public function up(): void
    {
        // Tests build the exact users they need; skip so counts stay predictable.
        if (app()->environment('testing')) {
            return;
        }

        $members = [
            ['key' => 'alfonso', 'name' => 'Alfonso', 'apple_id' => config('site.family.alfonso_apple_id'), 'email' => null],
            ['key' => 'saida', 'name' => 'Saida', 'apple_id' => config('site.family.saida_apple_id'), 'email' => null],
            ['key' => 'regina', 'name' => 'Regina', 'apple_id' => null, 'email' => 'regina@bribiesca.local'],
            ['key' => 'andres', 'name' => 'Andrés', 'apple_id' => null, 'email' => 'andres@bribiesca.local'],
        ];

        foreach ($members as $member) {
            $match = $member['apple_id']
                ? ['apple_id' => $member['apple_id']]
                : ['family_member' => $member['key']];

            $user = User::firstOrNew($match);
            $user->family_member = $member['key'];
            $user->name = $user->name ?: $member['name'];

            if ($member['email'] && ! $user->email) {
                $user->email = $member['email'];
            }

            if (! $user->exists) {
                $user->password = bcrypt(Str::random(40));
            }

            $user->save();
        }
    }

    public function down(): void
    {
        // Leaving the profiles in place is safe; data may already reference them.
    }
};
