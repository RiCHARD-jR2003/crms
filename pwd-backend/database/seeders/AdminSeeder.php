<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        $user = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'email' => 'admin@pdao.com',
                'password' => Hash::make('admin123'),
                'role' => 'Admin',
                'status' => 'active',
                'password_change_required' => false // Admin users don't need to change password
            ]
        );

        // Create admin record
        Admin::updateOrCreate(
            ['userID' => $user->userID],
            ['userID' => $user->userID]
        );

        echo "Admin user created successfully!\n";
        echo "Username: admin\n";
        echo "Password: admin123\n";
        echo "Email: admin@pdao.com\n";
        echo "Access: Dashboard, PWD Records, PWD Card, Ayuda, Benefit Tracking, Support Desk\n";
    }
}
