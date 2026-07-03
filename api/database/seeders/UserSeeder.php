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
            User::factory()->create([
                'name' => $name,
                'email' => $email,
                'password' => bcrypt($password),
            ]);
        }

        $this->seedFamilyMembers();
    }

    /**
     * Create the known family members from `site.family` so their Apple sub is
     * linked to a name before they ever sign in. Idempotent across seeds.
     */
    private function seedFamilyMembers(): void
    {
        foreach (config('site.family') as $member) {
            if (empty($member['apple_id'])) {
                continue;
            }

            User::firstOrCreate(
                ['apple_id' => $member['apple_id']],
                [
                    'name' => $member['name'] ?? 'Friend',
                    'password' => bcrypt(Str::random(40)),
                ],
            );
        }
    }
}
