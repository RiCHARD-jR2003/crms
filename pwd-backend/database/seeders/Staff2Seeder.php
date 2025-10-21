<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class Staff2Seeder extends Seeder
{
    public function run()
    {
        // Create Staff2 user
        $user = User::updateOrCreate(
            ['username' => 'staff2'],
            [
                'email' => 'staff2@pdao.com',
                'password' => Hash::make('staff123'),
                'role' => 'Staff2',
                'status' => 'active',
                'password_change_required' => false // Staff users don't need to change password initially
            ]
        );

        // Create Admin record for Staff2 user (needed for some API endpoints)
        Admin::updateOrCreate(
            ['userID' => $user->userID],
            ['userID' => $user->userID]
        );

        echo "Staff2 user created successfully!\n";
        echo "Username: staff2\n";
        echo "Password: staff123\n";
        echo "Email: staff2@pdao.com\n";
        echo "Access: Ayuda, Benefit Tracking\n";
        echo "Role: Staff2 - Ayuda & Benefits Management\n";
    }
}