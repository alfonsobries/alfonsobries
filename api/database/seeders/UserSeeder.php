<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds. The family member profiles are created by a
     * migration; here we only seed the optional admin account.
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
    }
}
