<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PWDMember;
use App\Models\Application;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CreateTestApplicantRCBoiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $email = 'rcboi2003@gmail.com';
        $firstName = 'RC';
        $lastName = 'Boi';
        $middleName = '';
        $age = 25; // Test age
        
        // Calculate birth date from age
        $currentYear = Carbon::now()->year;
        $birthYear = $currentYear - $age;
        $birthDate = Carbon::create($birthYear, 6, 15)->format('Y-m-d'); // June 15th of birth year
        
        // Check if user already exists
        $existingUser = User::where('email', $email)->first();
        
        if ($existingUser) {
            $this->command->warn("⚠ User with email {$email} already exists. Updating...");
            $user = $existingUser;
            $user->update([
                'username' => $email,
                'role' => 'PWDMember',
                'status' => 'active',
                'password_change_required' => false
            ]);
        } else {
            // Create User account
            $user = User::create([
                'username' => $email,
                'email' => $email,
                'password' => Hash::make('password123'), // Default password
                'role' => 'PWDMember',
                'status' => 'active',
                'password_change_required' => false
            ]);
            $this->command->info("✓ User account created (ID: {$user->userID})");
        }
        
        // Generate PWD ID
        $pwdId = 'PWD-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT);
        
        // Check if PWD Member already exists
        $existingMember = PWDMember::where('userID', $user->userID)->first();
        
        if ($existingMember) {
            $this->command->warn("⚠ PWD Member record already exists. Updating...");
            $existingMember->update([
                'pwd_id' => $pwdId,
                'pwd_id_generated_at' => now(),
                'firstName' => $firstName,
                'lastName' => $lastName,
                'middleName' => $middleName,
                'birthDate' => $birthDate,
                'gender' => 'Male',
                'disabilityType' => 'Physical Disability', // Default for testing
                'address' => 'Banlic, Cabuyao City, Laguna',
                'contactNumber' => '09123456789',
                'email' => $email,
                'barangay' => 'Banlic',
                'emergencyContact' => 'Emergency Contact',
                'emergencyPhone' => '09123456788',
                'emergencyRelationship' => 'Family',
                'status' => 'Active',
                'cardClaimed' => false,
                'cardIssueDate' => null,
                'cardExpirationDate' => null,
                'renewal_flag' => false,
                'flagged_at' => null
            ]);
            $pwdMember = $existingMember;
        } else {
            // Create PWD Member record
            $pwdMember = PWDMember::create([
                'userID' => $user->userID,
                'pwd_id' => $pwdId,
                'pwd_id_generated_at' => now(),
                'firstName' => $firstName,
                'lastName' => $lastName,
                'middleName' => $middleName,
                'birthDate' => $birthDate,
                'gender' => 'Male',
                'disabilityType' => 'Physical Disability',
                'address' => 'Banlic, Cabuyao City, Laguna',
                'contactNumber' => '09123456789',
                'email' => $email,
                'barangay' => 'Banlic',
                'emergencyContact' => 'Emergency Contact',
                'emergencyPhone' => '09123456788',
                'emergencyRelationship' => 'Family',
                'status' => 'Active',
                'cardClaimed' => false,
                'cardIssueDate' => null,
                'cardExpirationDate' => null,
                'renewal_flag' => false,
                'flagged_at' => null
            ]);
            $this->command->info("✓ PWD Member record created");
        }
        
        // Check if Application already exists
        $existingApplication = Application::where('email', $email)->first();
        
        if ($existingApplication) {
            $this->command->warn("⚠ Application already exists. Updating...");
            $existingApplication->update([
                'pwdID' => $user->userID,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'middleName' => $middleName,
                'birthDate' => $birthDate,
                'gender' => 'Male',
                'disabilityType' => 'Physical Disability',
                'address' => 'Banlic, Cabuyao City, Laguna',
                'barangay' => 'Banlic',
                'contactNumber' => '09123456789',
                'email' => $email,
                'status' => 'Pending Assessment', // Ready for disability assessment
                'assessment_status' => 'pending', // Ready for assessment
                'submissionDate' => now()->format('Y-m-d'),
            ]);
            $application = $existingApplication;
        } else {
            // Create Application record for disability assessment testing
            $application = Application::create([
                'pwdID' => $user->userID,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'middleName' => $middleName,
                'birthDate' => $birthDate,
                'gender' => 'Male',
                'disabilityType' => 'Physical Disability',
                'address' => 'Banlic, Cabuyao City, Laguna',
                'barangay' => 'Banlic',
                'contactNumber' => '09123456789',
                'email' => $email,
                'status' => 'Pending Assessment', // Ready for disability assessment
                'assessment_status' => 'pending', // Ready for assessment
                'submissionDate' => now()->format('Y-m-d'),
            ]);
            $this->command->info("✓ Application record created (ID: {$application->applicationID})");
        }
        
        $this->command->newLine();
        $this->command->info('✅ Test applicant account created successfully:');
        $this->command->info('   - User ID: ' . $user->userID);
        $this->command->info('   - PWD ID: ' . $pwdId);
        $this->command->info('   - Application ID: ' . $application->applicationID);
        $this->command->info('   - Name: ' . $firstName . ' ' . $lastName);
        $this->command->info('   - Email: ' . $email);
        $this->command->info('   - Age: ' . $age);
        $this->command->info('   - Birth Date: ' . $birthDate);
        $this->command->info('   - Barangay: Banlic');
        $this->command->info('   - Disability: Physical Disability');
        $this->command->info('   - Application Status: Pending Assessment');
        $this->command->info('   - Assessment Status: pending (ready for disability assessment)');
        $this->command->info('   - Default Password: password123');
        $this->command->newLine();
        $this->command->info('📝 This account is ready for disability assessment testing!');
        $this->command->newLine();
    }
}

