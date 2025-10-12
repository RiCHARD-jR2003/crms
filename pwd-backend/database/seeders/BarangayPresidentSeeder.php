<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\BarangayPresident;
use Illuminate\Support\Facades\Hash;

class BarangayPresidentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all barangays with their contact information
        $barangays = [
            [
                'name' => 'Baclaran',
                'contact_number' => '+63 999 111 1111',
                'email' => 'bpbaclaran@pdao.com'
            ],
            [
                'name' => 'Banay-Banay',
                'contact_number' => '+63 999 123 4567',
                'email' => 'bpbanaybanay@pdao.com'
            ],
            [
                'name' => 'Banlic',
                'contact_number' => '+63 999 234 5678',
                'email' => 'bpbanlic@pdao.com'
            ],
            [
                'name' => 'Bigaa',
                'contact_number' => '+63 999 345 6789',
                'email' => 'bpbigaa@pdao.com'
            ],
            [
                'name' => 'Butong',
                'contact_number' => '+63 999 456 7890',
                'email' => 'bpbutong@pdao.com'
            ],
            [
                'name' => 'Casile',
                'contact_number' => '+63 999 567 8901',
                'email' => 'bpcasile@pdao.com'
            ],
            [
                'name' => 'Diezmo',
                'contact_number' => '+63 999 678 9012',
                'email' => 'bpdiezmo@pdao.com'
            ],
            [
                'name' => 'Gulod',
                'contact_number' => '+63 999 789 0123',
                'email' => 'bpgulod@pdao.com'
            ],
            [
                'name' => 'Mamatid',
                'contact_number' => '+63 999 890 1234',
                'email' => 'bpmamatid@pdao.com'
            ],
            [
                'name' => 'Marinig',
                'contact_number' => '+63 999 901 2345',
                'email' => 'bpmarinig@pdao.com'
            ],
            [
                'name' => 'Niugan',
                'contact_number' => '+63 999 012 3456',
                'email' => 'bpniugan@pdao.com'
            ],
            [
                'name' => 'Pittland',
                'contact_number' => '+63 999 111 2222',
                'email' => 'bppittland@pdao.com'
            ],
            [
                'name' => 'Pulo',
                'contact_number' => '+63 999 222 3333',
                'email' => 'bppulo@pdao.com'
            ],
            [
                'name' => 'Sala',
                'contact_number' => '+63 999 333 4444',
                'email' => 'bpsala@pdao.com'
            ],
            [
                'name' => 'San Isidro',
                'contact_number' => '+63 999 444 5555',
                'email' => 'bpsanisidro@pdao.com'
            ],
            [
                'name' => 'Barangay I Poblacion',
                'contact_number' => '+63 999 555 6666',
                'email' => 'bpbarangay1poblacion@pdao.com'
            ],
            [
                'name' => 'Barangay II Poblacion',
                'contact_number' => '+63 999 666 7777',
                'email' => 'bpbarangay2poblacion@pdao.com'
            ],
            [
                'name' => 'Barangay III Poblacion',
                'contact_number' => '+63 999 777 8888',
                'email' => 'bpbarangay3poblacion@pdao.com'
            ]
        ];

        $createdUsers = [];

        foreach ($barangays as $index => $barangayData) {
            // Generate unique username and email for each barangay president
            $barangaySlug = strtolower(str_replace([' ', '-'], '_', $barangayData['name']));
            $username = 'bp_' . $barangaySlug;
            $email = $barangayData['email'];
            $barangayID = 'BRGY' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);

            // Create Barangay President User (or update if exists)
            $user = User::updateOrCreate(
                ['username' => $username],
                [
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'role' => 'BarangayPresident',
                    'status' => 'active',
                    'password_change_required' => false // Barangay President users don't need to change password
                ]
            );

            // Create Barangay President Record (or update if exists)
            BarangayPresident::updateOrCreate(
                ['userID' => $user->userID],
                [
                    'barangayID' => $barangayID,
                    'barangay' => $barangayData['name'],
                    'contact_number' => $barangayData['contact_number'],
                    'email' => $barangayData['email']
                ]
            );

            $createdUsers[] = [
                'barangay' => $barangayData['name'],
                'username' => $username,
                'email' => $email,
                'contact_number' => $barangayData['contact_number'],
                'password' => 'password123'
            ];
        }

        $this->command->info('All Barangay Presidents created successfully!');
        $this->command->info('Total created: ' . count($createdUsers));
        
        foreach ($createdUsers as $user) {
            $this->command->info("Barangay: {$user['barangay']} | Username: {$user['username']} | Email: {$user['email']} | Contact: {$user['contact_number']} | Password: {$user['password']}");
        }
    }
}
