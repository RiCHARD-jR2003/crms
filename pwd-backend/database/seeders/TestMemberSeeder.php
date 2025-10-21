<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PWDMember;
use Illuminate\Support\Facades\Hash;

class TestMemberSeeder extends Seeder
{
    public function run()
    {
        // Create test PWD member user
        $user = User::updateOrCreate(
            ['email' => 'testmember@pwd.com'],
            [
                'username' => 'testmember',
                'email' => 'testmember@pwd.com',
                'password' => Hash::make('testmember123'),
                'role' => 'PWDMember',
                'status' => 'active',
                'password_change_required' => false
            ]
        );

        // Create corresponding PWD member record
        PWDMember::updateOrCreate(
            ['userID' => $user->userID],
            [
                'userID' => $user->userID,
                'firstName' => 'Juan',
                'lastName' => 'Dela Cruz',
                'middleName' => 'Santos',
                'suffix' => '',
                'birthDate' => '1990-05-15',
                'gender' => 'Male',
                'disabilityType' => 'Physical Disability',
                'address' => '123 Main Street, Barangay Sample',
                'contactNumber' => '09123456789',
                'email' => 'testmember@pwd.com',
                'barangay' => 'Sample Barangay',
                'emergencyContact' => 'Maria Dela Cruz',
                'emergencyPhone' => '09987654321',
                'emergencyRelationship' => 'Mother',
                'status' => 'Active'
            ]
        );

        // Create additional test members
        $user2 = User::updateOrCreate(
            ['email' => 'maria@pwd.com'],
            [
                'username' => 'maria',
                'email' => 'maria@pwd.com',
                'password' => Hash::make('maria123'),
                'role' => 'PWDMember',
                'status' => 'active',
                'password_change_required' => false
            ]
        );

        PWDMember::updateOrCreate(
            ['userID' => $user2->userID],
            [
                'userID' => $user2->userID,
                'firstName' => 'Maria',
                'lastName' => 'Garcia',
                'middleName' => 'Lopez',
                'suffix' => '',
                'birthDate' => '1985-08-22',
                'gender' => 'Female',
                'disabilityType' => 'Visual Impairment',
                'address' => '456 Oak Avenue, Barangay Central',
                'contactNumber' => '09111222333',
                'email' => 'maria@pwd.com',
                'barangay' => 'Central Barangay',
                'emergencyContact' => 'Jose Garcia',
                'emergencyPhone' => '09444555666',
                'emergencyRelationship' => 'Husband',
                'status' => 'Active'
            ]
        );

        $user3 = User::updateOrCreate(
            ['email' => 'pedro@pwd.com'],
            [
                'username' => 'pedro',
                'email' => 'pedro@pwd.com',
                'password' => Hash::make('pedro123'),
                'role' => 'PWDMember',
                'status' => 'active',
                'password_change_required' => false
            ]
        );

        PWDMember::updateOrCreate(
            ['userID' => $user3->userID],
            [
                'userID' => $user3->userID,
                'firstName' => 'Pedro',
                'lastName' => 'Reyes',
                'middleName' => 'Mendoza',
                'suffix' => '',
                'birthDate' => '1978-12-10',
                'gender' => 'Male',
                'disabilityType' => 'Hearing Impairment',
                'address' => '789 Pine Street, Barangay North',
                'contactNumber' => '09777888999',
                'email' => 'pedro@pwd.com',
                'barangay' => 'North Barangay',
                'emergencyContact' => 'Ana Reyes',
                'emergencyPhone' => '09123456789',
                'emergencyRelationship' => 'Sister',
                'status' => 'Active'
            ]
        );

        $this->command->info('Test PWD Members created successfully!');
        $this->command->info('');
        $this->command->info('=== TEST ACCOUNTS ===');
        $this->command->info('1. Username: testmember | Email: testmember@pwd.com | Password: testmember123');
        $this->command->info('   Name: Juan Santos Dela Cruz | Disability: Physical Disability');
        $this->command->info('');
        $this->command->info('2. Username: maria | Email: maria@pwd.com | Password: maria123');
        $this->command->info('   Name: Maria Lopez Garcia | Disability: Visual Impairment');
        $this->command->info('');
        $this->command->info('3. Username: pedro | Email: pedro@pwd.com | Password: pedro123');
        $this->command->info('   Name: Pedro Mendoza Reyes | Disability: Hearing Impairment');
    }
}
