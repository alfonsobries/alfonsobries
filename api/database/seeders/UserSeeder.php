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

        $this->seedFamilyMember('Alfonso', config('site.family.alfonso_apple_id'));
        $this->seedFamilyMember('Saida', config('site.family.saida_apple_id'));
    }

    /**
     * Link an Apple sub to a name before they ever sign in. Idempotent.
     */
    private function seedFamilyMember(string $name, ?string $appleId): void
    {
        if (! $appleId) {
            return;
        }

        User::firstOrCreate(
            ['apple_id' => $appleId],
            [
                'name' => $name,
                'password' => bcrypt(Str::random(40)),
            ],
        );
    }
}
