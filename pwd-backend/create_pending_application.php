<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Application;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

$email = 'richardcarandangjr@gmail.com';
$username = 'test_rejection_applicant';
$password = Hash::make('Test123!@#');

echo "Creating pending application for rejection testing...\n\n";

DB::beginTransaction();

try {
    // Check if user already exists
    $user = User::where('username', $username)->orWhere('email', $email)->first();
    
    if ($user) {
        echo "⚠ User already exists, updating...\n";
        $user->update([
            'email' => $email,
            'password' => $password,
            'role' => 'PWDMember',
            'status' => 'Active',
            'password_change_required' => false
        ]);
    } else {
        // Create User
        $user = User::create([
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'role' => 'PWDMember',
            'status' => 'Active',
            'password_change_required' => false
        ]);
    }
    
    echo "✓ User created/updated (ID: {$user->userID}, Username: {$user->username})\n";
    
    // Generate application ID
    $applicationId = 'APP-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT);
    $referenceNumber = 'REF-' . strtoupper(substr(md5($user->userID . time()), 0, 8));
    
    // Check if application already exists
    $application = Application::where('applicationID', $applicationId)
        ->orWhere('email', $email)
        ->first();
    
    if ($application) {
        echo "⚠ Application already exists, updating...\n";
        $application->update([
            'pwdID' => $user->userID,
            'firstName' => 'Richard',
            'lastName' => 'Carandang',
            'middleName' => 'Jr',
            'birthDate' => '1990-05-15',
            'gender' => 'Male',
            'disabilityType' => 'Physical Impairment',
            'address' => '456 Test Avenue',
            'barangay' => 'Banlic',
            'contactNumber' => '09123456789',
            'email' => $email,
            'idType' => 'National ID',
            'idNumber' => 'NAT' . str_pad($user->userID, 8, '0', STR_PAD_LEFT),
            'emergencyContact' => 'Emergency Contact Person',
            'emergencyPhone' => '09123456788',
            'emergencyRelationship' => 'Family',
            'status' => 'Pending Barangay Approval',
            'submissionDate' => now()->subDays(2),
            'referenceNumber' => $referenceNumber,
            'remarks' => 'Test application for rejection process testing'
        ]);
    } else {
        // Create Application
        $application = Application::create([
            'applicationID' => $applicationId,
            'pwdID' => $user->userID,
            'firstName' => 'Richard',
            'lastName' => 'Carandang',
            'middleName' => 'Jr',
            'birthDate' => '1990-05-15',
            'gender' => 'Male',
            'disabilityType' => 'Physical Impairment',
            'address' => '456 Test Avenue',
            'barangay' => 'Banlic',
            'contactNumber' => '09123456789',
            'email' => $email,
            'idType' => 'National ID',
            'idNumber' => 'NAT' . str_pad($user->userID, 8, '0', STR_PAD_LEFT),
            'emergencyContact' => 'Emergency Contact Person',
            'emergencyPhone' => '09123456788',
            'emergencyRelationship' => 'Family',
            'status' => 'Pending Barangay Approval',
            'submissionDate' => now()->subDays(2),
            'referenceNumber' => $referenceNumber,
            'remarks' => 'Test application for rejection process testing'
        ]);
    }
    
    echo "✓ Application created/updated\n";
    echo "  - Application ID: {$application->applicationID}\n";
    echo "  - Reference Number: {$application->referenceNumber}\n";
    echo "  - Status: {$application->status}\n";
    echo "  - Email: {$application->email}\n";
    echo "  - Barangay: {$application->barangay}\n";
    
    DB::commit();
    
    echo "\n========================================\n";
    echo "SUCCESS! Pending application created.\n";
    echo "========================================\n\n";
    echo "Login Credentials:\n";
    echo "  Username: {$username}\n";
    echo "  Email: {$email}\n";
    echo "  Password: Test123!@#\n\n";
    echo "Application Details:\n";
    echo "  Application ID: {$application->applicationID}\n";
    echo "  Reference Number: {$application->referenceNumber}\n";
    echo "  Status: {$application->status}\n";
    echo "  Name: {$application->firstName} {$application->lastName}\n";
    echo "  Barangay: {$application->barangay}\n\n";
    echo "This application is ready for rejection testing at:\n";
    echo "  1. Barangay Level (Barangay President)\n";
    echo "  2. Admin Level (Admin/SuperAdmin)\n";
    echo "  3. Assessment Level (if approved by barangay)\n";
    
} catch (\Exception $e) {
    DB::rollBack();
    echo "\nERROR: Failed to create pending application\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

