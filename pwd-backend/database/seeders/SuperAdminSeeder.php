<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SuperAdmin;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create superadmin user
        $user = User::updateOrCreate(
            ['username' => 'superadmin'],
            [
                'email' => 'superadmin@pdao.com',
                'password' => Hash::make('superadmin123'),
                'role' => 'SuperAdmin',
                'status' => 'active',
                'password_change_required' => false // SuperAdmin users don't need to change password
            ]
        );

        // Create superadmin record
        SuperAdmin::updateOrCreate(
            ['userID' => $user->userID],
            ['userID' => $user->userID]
        );

        echo "SuperAdmin user created successfully!\n";
        echo "Username: superadmin\n";
        echo "Password: superadmin123\n";
        echo "Email: superadmin@pdao.com\n";
        echo "Access: All features including Document Management and Change Password\n";
    }
}
