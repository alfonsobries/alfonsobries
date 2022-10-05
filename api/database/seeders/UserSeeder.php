<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $name = env('INITIAL_USER_NAME');
        $email = env('INITIAL_USER_EMAIL');
        $password = env('INITIAL_USER_PASSWORD');


        if ($name && $email && $password) {
            User::factory()->create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);
        }
    }
}
