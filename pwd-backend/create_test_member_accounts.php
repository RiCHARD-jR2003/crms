<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\PWDMember;
use App\Models\Application;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

$testEmail = 'nhoelsarino@gmail.com';
$defaultPassword = Hash::make('Test123!@#'); // Default password for all test accounts

$testAccounts = [
    [
        'username' => 'test_member_new',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'New Member',
        'description' => 'New Member - No Application'
    ],
    [
        'username' => 'test_member_pending',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'Pending Member',
        'description' => 'Pending Application Member',
        'application_status' => 'Pending Barangay Approval'
    ],
    [
        'username' => 'test_member_approved',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'Approved Member',
        'description' => 'Approved Member - No ID Card Yet',
        'application_status' => 'Approved',
        'pwd_id_generated' => true,
        'id_claimed' => false
    ],
    [
        'username' => 'test_member_active',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'Active Member',
        'description' => 'Active Member with ID Card',
        'application_status' => 'Approved',
        'pwd_id_generated' => true,
        'id_claimed' => true
    ],
    [
        'username' => 'test_member_assessment',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'Assessment Member',
        'description' => 'Member with Pending Assessment',
        'application_status' => 'For Assessment',
        'assessment_status' => 'Pending'
    ],
    [
        'username' => 'test_member_assessed',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'Assessed Member',
        'description' => 'Member with Completed Assessment',
        'application_status' => 'Pending Admin Approval',
        'assessment_status' => 'Completed'
    ],
    [
        'username' => 'test_member_other_barangay',
        'barangay' => 'Mamatid',
        'firstName' => 'Test',
        'lastName' => 'Other Barangay',
        'description' => 'Member from Different Barangay',
        'application_status' => 'Approved',
        'pwd_id_generated' => true,
        'id_claimed' => true
    ],
    [
        'username' => 'test_member_rejected',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'Rejected Member',
        'description' => 'Member with Rejected Application',
        'application_status' => 'Rejected',
        'rejection_remarks' => 'Test rejection - Incomplete documents'
    ],
    [
        'username' => 'test_member_with_benefits',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'Benefits Member',
        'description' => 'Member with Benefits Claimed',
        'application_status' => 'Approved',
        'pwd_id_generated' => true,
        'id_claimed' => true,
        'has_claimed_benefits' => true
    ],
    [
        'username' => 'test_member_renewal',
        'barangay' => 'Banlic',
        'firstName' => 'Test',
        'lastName' => 'Renewal Member',
        'description' => 'Member Needing ID Renewal',
        'application_status' => 'Approved',
        'pwd_id_generated' => true,
        'id_claimed' => true,
        'id_expiry_near' => true
    ]
];

echo "Creating test member accounts...\n\n";

DB::beginTransaction();

try {
    foreach ($testAccounts as $index => $account) {
        $accountNum = $index + 1;
        echo "Creating account {$accountNum}/10: {$account['username']} - {$account['description']}\n";
        
        // Check if user already exists
        $user = User::where('username', $account['username'])->first();
        
        if ($user) {
            echo "  ⚠ User already exists, updating...\n";
            $user->update([
                'email' => $testEmail,
                'password' => $defaultPassword,
                'role' => 'PWDMember',
                'status' => 'Active',
                'password_change_required' => false
            ]);
        } else {
            // Create User
            $user = User::create([
                'username' => $account['username'],
                'email' => $testEmail,
                'password' => $defaultPassword,
                'role' => 'PWDMember',
                'status' => 'Active',
                'password_change_required' => false
            ]);
        }
        
        echo "  ✓ User ready (ID: {$user->userID})\n";
        
        // Generate PWD ID if needed
        $pwdId = null;
        if (isset($account['pwd_id_generated']) && $account['pwd_id_generated']) {
            $pwdId = 'PWD-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT);
        }
        
        // Check if PWD Member already exists
        $pwdMember = PWDMember::where('userID', $user->userID)->first();
        
        if ($pwdMember) {
            echo "  ⚠ PWD Member already exists, updating...\n";
            $pwdMember->update([
                'pwd_id' => $pwdId,
                'pwd_id_generated_at' => $pwdId ? now() : null,
                'firstName' => $account['firstName'],
                'lastName' => $account['lastName'],
                'middleName' => 'Test',
                'birthDate' => '1990-01-01',
                'gender' => 'Male',
                'disabilityType' => 'Physical',
                'address' => '123 Test Street',
                'barangay' => $account['barangay'],
                'contactNumber' => '09123456789',
                'email' => $testEmail,
                'emergencyContact' => 'Emergency Contact',
                'emergencyPhone' => '09123456788',
                'emergencyRelationship' => 'Family',
                'status' => 'Active'
            ]);
        } else {
            // Create PWD Member record
            $pwdMember = PWDMember::create([
                'userID' => $user->userID,
                'pwd_id' => $pwdId,
                'pwd_id_generated_at' => $pwdId ? now() : null,
                'firstName' => $account['firstName'],
                'lastName' => $account['lastName'],
                'middleName' => 'Test',
                'birthDate' => '1990-01-01',
                'gender' => 'Male',
                'disabilityType' => 'Physical',
                'address' => '123 Test Street',
                'barangay' => $account['barangay'],
                'contactNumber' => '09123456789',
                'email' => $testEmail,
                'emergencyContact' => 'Emergency Contact',
                'emergencyPhone' => '09123456788',
                'emergencyRelationship' => 'Family',
                'status' => 'Active'
            ]);
        }
        
        // Handle card claim status and expiration dates
        if (isset($account['id_claimed']) && $account['id_claimed']) {
            $cardUpdateData = [
                'cardClaimed' => true,
                'cardIssueDate' => now()->subYears(3), // Card issued 3 years ago
            ];
            
            // For renewal account, set expiration date to near future (5 days)
            if (isset($account['id_expiry_near']) && $account['id_expiry_near']) {
                $cardUpdateData['cardExpirationDate'] = now()->addDays(5); // Expires in 5 days
                $cardUpdateData['renewal_flag'] = true;
                $cardUpdateData['flagged_at'] = now()->subDays(1); // Flagged yesterday
                echo "  ⚠ Setting card expiration to near future (5 days) for renewal testing\n";
            } else {
                // For other accounts with claimed cards, set expiration to 3 years from now
                $cardUpdateData['cardExpirationDate'] = now()->addYears(3);
            }
            
            $pwdMember->update($cardUpdateData);
            echo "  ✓ Card claim status updated\n";
        }
        
        echo "  ✓ PWD Member ready (PWD ID: {$pwdId})\n";
        
        // Create/Update Application if needed
        if (isset($account['application_status'])) {
            $applicationId = 'APP-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT);
            $application = Application::where('applicationID', $applicationId)->first();
            
            if ($application) {
                echo "  ⚠ Application already exists, updating...\n";
                $application->update([
                    'pwdID' => $user->userID,
                    'firstName' => $account['firstName'],
                    'lastName' => $account['lastName'],
                    'middleName' => 'Test',
                    'birthDate' => '1990-01-01',
                    'gender' => 'Male',
                    'disabilityType' => 'Physical',
                    'address' => '123 Test Street',
                    'barangay' => $account['barangay'],
                    'contactNumber' => '09123456789',
                    'email' => $testEmail,
                    'idType' => 'National ID',
                    'idNumber' => 'TEST' . str_pad($user->userID, 8, '0', STR_PAD_LEFT),
                    'emergencyContact' => 'Emergency Contact',
                    'emergencyPhone' => '09123456788',
                    'emergencyRelationship' => 'Family',
                    'status' => $account['application_status'],
                    'remarks' => isset($account['rejection_remarks']) ? $account['rejection_remarks'] : 'Test account - ' . $account['description']
                ]);
            } else {
                // Check if application with this email already exists (for test accounts)
                $existingAppByEmail = Application::where('email', $testEmail)
                    ->where('applicationID', '!=', $applicationId)
                    ->first();
                
                if ($existingAppByEmail) {
                    // Delete old application with same email to avoid unique constraint
                    $existingAppByEmail->delete();
                    echo "  ⚠ Deleted old application with same email\n";
                }
                
                $application = Application::create([
                    'applicationID' => $applicationId,
                    'pwdID' => $user->userID,
                    'firstName' => $account['firstName'],
                    'lastName' => $account['lastName'],
                    'middleName' => 'Test',
                    'birthDate' => '1990-01-01',
                    'gender' => 'Male',
                    'disabilityType' => 'Physical',
                    'address' => '123 Test Street',
                    'barangay' => $account['barangay'],
                    'contactNumber' => '09123456789',
                    'email' => $testEmail,
                    'idType' => 'National ID', // Required field
                    'idNumber' => 'TEST' . str_pad($user->userID, 8, '0', STR_PAD_LEFT), // Required field
                    'emergencyContact' => 'Emergency Contact',
                    'emergencyPhone' => '09123456788',
                    'emergencyRelationship' => 'Family',
                    'status' => $account['application_status'],
                    'remarks' => isset($account['rejection_remarks']) ? $account['rejection_remarks'] : 'Test account - ' . $account['description'],
                    'submissionDate' => now()->subDays(rand(1, 30))
                ]);
            }
            
            echo "  ✓ Application ready (Status: {$account['application_status']})\n";
        }
        
        echo "\n";
    }
    
    DB::commit();
    
    echo "========================================\n";
    echo "SUCCESS! All test accounts created.\n";
    echo "========================================\n\n";
    echo "Email: {$testEmail}\n";
    echo "Password: Test123!@#\n\n";
    echo "Accounts created:\n";
    foreach ($testAccounts as $account) {
        echo "  - {$account['username']}: {$account['description']}\n";
    }
    echo "\n";
    
} catch (\Exception $e) {
    DB::rollBack();
    echo "\nERROR: Failed to create test accounts\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

