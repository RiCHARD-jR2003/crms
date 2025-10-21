<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class Staff1Seeder extends Seeder
{
    public function run()
    {
        // Create Staff1 user
        $user = User::updateOrCreate(
            ['username' => 'staff1'],
            [
                'email' => 'staff1@pdao.com',
                'password' => Hash::make('staff123'),
                'role' => 'Staff1',
                'status' => 'active',
                'password_change_required' => false // Staff users don't need to change password initially
            ]
        );

        // Create Admin record for Staff1 user (needed for some API endpoints)
        Admin::updateOrCreate(
            ['userID' => $user->userID],
            ['userID' => $user->userID]
        );

        echo "Staff1 user created successfully!\n";
        echo "Username: staff1\n";
        echo "Password: staff123\n";
        echo "Email: staff1@pdao.com\n";
        echo "Access: PWD Masterlist, PWD Records\n";
        echo "Role: Staff1 - PWD Records & Masterlist Management\n";
    }
}