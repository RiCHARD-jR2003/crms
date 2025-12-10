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
$username = 'rc_carandang_test';
$password = Hash::make('Test123!@#');

echo "Creating test application for RC Carandang (rejection testing)...\n\n";

DB::beginTransaction();

try {
    // Check if user already exists
    $user = User::where('username', $username)->orWhere('email', $email)->first();
    
    if ($user) {
        echo "⚠ User already exists with email {$email}, creating new application...\n";
        // Use existing user but create a new application
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
        echo "✓ User created (ID: {$user->userID}, Username: {$user->username})\n";
    }
    
    // Generate unique application ID and reference number
    $timestamp = time();
    $applicationId = 'APP-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT) . '-' . substr($timestamp, -4);
    $referenceNumber = 'REF-' . strtoupper(substr(md5($user->userID . $timestamp . 'rc'), 0, 8));
    
    // Check if application with this email already exists (due to unique constraint)
    $existingApplication = Application::where('email', $email)->first();
    
    if ($existingApplication) {
        echo "⚠ Application with email {$email} already exists, updating to RC Carandang...\n";
        $application = $existingApplication;
        $application->update([
            'pwdID' => $user->userID,
            'firstName' => 'RC',
            'lastName' => 'Carandang',
            'middleName' => 'Test',
            'birthDate' => '1992-08-20',
            'gender' => 'Male',
            'disabilityType' => 'Visual Impairment',
            'address' => '789 Test Street, Barangay Banlic',
            'barangay' => 'Banlic',
            'contactNumber' => '09187654321',
            'idType' => 'National ID',
            'idNumber' => 'NAT' . str_pad($user->userID, 8, '0', STR_PAD_LEFT) . 'RC',
            'emergencyContact' => 'Emergency Contact',
            'emergencyPhone' => '09187654320',
            'emergencyRelationship' => 'Family',
            'status' => 'Pending Barangay Approval',
            'submissionDate' => now()->subDays(1),
            'remarks' => 'Test application for RC Carandang - Rejection testing'
        ]);
        echo "✓ Updated existing application\n";
    } else {
        // Create new Application
        $application = Application::create([
            'applicationID' => $applicationId,
            'pwdID' => $user->userID,
            'firstName' => 'RC',
            'lastName' => 'Carandang',
            'middleName' => 'Test',
            'birthDate' => '1992-08-20',
            'gender' => 'Male',
            'disabilityType' => 'Visual Impairment',
            'address' => '789 Test Street, Barangay Banlic',
            'barangay' => 'Banlic',
            'contactNumber' => '09187654321',
            'email' => $email,
            'idType' => 'National ID',
            'idNumber' => 'NAT' . str_pad($user->userID, 8, '0', STR_PAD_LEFT) . 'RC',
            'emergencyContact' => 'Emergency Contact',
            'emergencyPhone' => '09187654320',
            'emergencyRelationship' => 'Family',
            'status' => 'Pending Barangay Approval',
            'submissionDate' => now()->subDays(1),
            'referenceNumber' => $referenceNumber,
            'remarks' => 'Test application for RC Carandang - Rejection testing'
        ]);
        echo "✓ Created new application\n";
    }
    
    echo "✓ Application created/updated\n";
    echo "  - Application ID: {$application->applicationID}\n";
    echo "  - Reference Number: {$application->referenceNumber}\n";
    echo "  - Status: {$application->status}\n";
    echo "  - Email: {$application->email}\n";
    echo "  - Name: {$application->firstName} {$application->lastName}\n";
    echo "  - Barangay: {$application->barangay}\n";
    
    DB::commit();
    
    echo "\n========================================\n";
    echo "SUCCESS! Test application created.\n";
    echo "========================================\n\n";
    echo "Application Details:\n";
    echo "  Application ID: {$application->applicationID}\n";
    echo "  Reference Number: {$application->referenceNumber}\n";
    echo "  Status: {$application->status}\n";
    echo "  Name: {$application->firstName} {$application->lastName}\n";
    echo "  Email: {$application->email}\n";
    echo "  Barangay: {$application->barangay}\n";
    echo "  Disability Type: {$application->disabilityType}\n";
    echo "  Submission Date: {$application->submissionDate}\n\n";
    echo "This application is ready for rejection testing.\n";
    echo "You can test rejection at:\n";
    echo "  1. Barangay Level (Barangay President Dashboard)\n";
    echo "  2. Admin Level (Admin/SuperAdmin Dashboard)\n";
    echo "  3. Assessment Level (if approved by barangay)\n\n";
    echo "To check status, use reference number: {$application->referenceNumber}\n";
    
} catch (\Exception $e) {
    DB::rollBack();
    echo "\nERROR: Failed to create test application\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

