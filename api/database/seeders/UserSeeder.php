<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $name = config('site.admin.name');
        $email = config('site.admin.email');
        $password = config('site.admin.password');

        if ($name && $email && $password) {
            User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => bcrypt($password),
                ],
            );
        }

        // The parents sign in with Apple; the kids never log in but still get a
        // row (with a placeholder email) so data can be attributed to them.
        $this->seedFamilyMember('alfonso', 'Alfonso', config('site.family.alfonso_apple_id'));
        $this->seedFamilyMember('saida', 'Saida', config('site.family.saida_apple_id'));
        $this->seedFamilyMember('regina', 'Regina', null, 'regina@bribiesca.local');
        $this->seedFamilyMember('andres', 'Andrés', null, 'andres@bribiesca.local');
    }

    /**
     * Ensure a family member exists and carries their canonical name and role.
     * Matched by Apple sub when they sign in, otherwise by their role. Idempotent.
     */
    private function seedFamilyMember(string $key, string $name, ?string $appleId, ?string $email = null): void
    {
        $match = $appleId ? ['apple_id' => $appleId] : ['family_member' => $key];

        $user = User::firstOrNew($match);
        $user->family_member = $key;
        $user->name = $name;

        if ($email && ! $user->email) {
            $user->email = $email;
        }

        if (! $user->exists) {
            $user->password = bcrypt(Str::random(40));
        }

        $user->save();
    }
}
