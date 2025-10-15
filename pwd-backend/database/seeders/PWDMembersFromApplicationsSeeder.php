<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PWDMembersFromApplicationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get all approved applications
        $approvedApplications = \App\Models\Application::where('status', 'Approved')->get();
        
        echo "Found " . $approvedApplications->count() . " approved applications to migrate to PWD members.\n";
        
        foreach ($approvedApplications as $app) {
            // Find or create the corresponding User record
            $user = \App\Models\User::where('email', $app->email)->first();
            
            if (!$user) {
                // Create user if doesn't exist
                $user = \App\Models\User::create([
                    'username' => $app->email,
                    'email' => $app->email,
                    'password' => \Illuminate\Support\Facades\Hash::make('temp_password_' . $app->applicationID),
                    'role' => 'PWDMember',
                    'status' => 'active'
                ]);
                echo "Created user for: {$app->firstName} {$app->lastName} (UserID: {$user->userID})\n";
            }
            
            // Generate PWD ID based on userID
            $pwdId = 'PWD-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT);
            
            // Insert into pwd_members table with correct userID
            DB::table('pwd_members')->insert([
                'userID' => $user->userID, // ✅ CORRECT: Use actual userID
                'firstName' => $app->firstName,
                'lastName' => $app->lastName,
                'middleName' => $app->middleName,
                'suffix' => $app->suffix,
                'birthDate' => $app->birthDate,
                'gender' => $app->gender,
                'disabilityType' => $app->disabilityType,
                'address' => $app->address,
                'contactNumber' => $app->contactNumber,
                'email' => $app->email,
                'barangay' => $app->barangay,
                'emergencyContact' => $app->emergencyContact,
                'emergencyPhone' => $app->emergencyPhone,
                'emergencyRelationship' => $app->emergencyRelationship,
                'status' => 'Active',
                'created_at' => $app->created_at,
                'updated_at' => $app->updated_at
            ]);
            
            // Update the application's pwdID to match the userID
            $app->update(['pwdID' => $user->userID]);
            
            echo "Migrated: {$app->firstName} {$app->lastName} (UserID: {$user->userID}, PWD ID: {$pwdId})\n";
        }
        
        echo "Migration completed successfully!\n";
    }
}
