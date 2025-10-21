<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class FrontDeskSeeder extends Seeder
{
    public function run()
    {
        // Create FrontDesk user
        $user = User::updateOrCreate(
            ['username' => 'frontdesk'],
            [
                'email' => 'frontdesk@pdao.com',
                'password' => Hash::make('frontdesk123'),
                'role' => 'FrontDesk',
                'status' => 'active',
                'password_change_required' => false // FrontDesk users don't need to change password initially
            ]
        );

        // Create Admin record for FrontDesk user (needed for support ticket system)
        Admin::updateOrCreate(
            ['userID' => $user->userID],
            ['userID' => $user->userID]
        );

        echo "FrontDesk user created successfully!\n";
        echo "Username: frontdesk\n";
        echo "Password: frontdesk123\n";
        echo "Email: frontdesk@pdao.com\n";
        echo "Access: PWD Card, Support Desk, Announcements\n";
        echo "Role: FrontDesk - Cards, Support & Announcements\n";
    }
}