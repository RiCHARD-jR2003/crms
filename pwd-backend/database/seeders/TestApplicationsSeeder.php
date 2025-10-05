<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Application;

class TestApplicationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create test applications with different statuses
        $testApplications = [
            [
                'firstName' => 'Maria',
                'lastName' => 'Santos',
                'middleName' => 'Garcia',
                'birthDate' => '1985-05-15',
                'gender' => 'Female',
                'disabilityType' => 'Visual Impairment',
                'address' => '123 Barangay Poblacion, Cabuyao, Laguna',
                'barangay' => 'Barangay I Poblacion',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'email' => 'maria.santos@test.com',
                'contactNumber' => '09123456789',
                'emergencyContact' => 'Juan Santos',
                'emergencyPhone' => '09187654321',
                'emergencyRelationship' => 'Father',
                'idType' => 'Driver License',
                'idNumber' => 'D123456789',
                'submissionDate' => now()->subDays(5),
                'status' => 'Pending Admin Approval',
                'remarks' => 'Application submitted for review'
            ],
            [
                'firstName' => 'Jose',
                'lastName' => 'Reyes',
                'middleName' => 'Mendoza',
                'birthDate' => '1990-08-22',
                'gender' => 'Male',
                'disabilityType' => 'Physical Disability',
                'address' => '456 Barangay Banlic, Cabuyao, Laguna',
                'barangay' => 'Banlic',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'email' => 'jose.reyes@test.com',
                'contactNumber' => '09123456790',
                'emergencyContact' => 'Maria Reyes',
                'emergencyPhone' => '09187654322',
                'emergencyRelationship' => 'Mother',
                'idType' => 'PhilHealth ID',
                'idNumber' => 'PH123456789',
                'submissionDate' => now()->subDays(3),
                'status' => 'Pending Barangay Approval',
                'remarks' => 'Awaiting barangay president approval'
            ],
            [
                'firstName' => 'Luz',
                'lastName' => 'Cruz',
                'middleName' => 'Villanueva',
                'birthDate' => '1988-12-10',
                'gender' => 'Female',
                'disabilityType' => 'Hearing Impairment',
                'address' => '789 Barangay Bigaa, Cabuyao, Laguna',
                'barangay' => 'Bigaa',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'email' => 'luz.cruz@test.com',
                'contactNumber' => '09123456791',
                'emergencyContact' => 'Pedro Cruz',
                'emergencyPhone' => '09187654323',
                'emergencyRelationship' => 'Brother',
                'idType' => 'Postal ID',
                'idNumber' => 'PO123456789',
                'submissionDate' => now()->subDays(1),
                'status' => 'Pending Admin Approval',
                'remarks' => 'Recently submitted application'
            ],
            [
                'firstName' => 'Robert',
                'lastName' => 'Gonzales',
                'middleName' => 'Sanchez',
                'birthDate' => '1975-03-18',
                'gender' => 'Male',
                'disabilityType' => 'Intellectual Disability',
                'address' => '321 Barangay Casile, Cabuyao, Laguna',
                'barangay' => 'Casile',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'email' => 'robert.gonzales@test.com',
                'contactNumber' => '09123456792',
                'emergencyContact' => 'Anna Gonzales',
                'emergencyPhone' => '09187654324',
                'emergencyRelationship' => 'Sister',
                'idType' => 'Senior Citizen ID',
                'idNumber' => 'SC123456789',
                'submissionDate' => now()->subDays(7),
                'status' => 'Pending Barangay Approval',
                'remarks' => 'Documentation complete, pending barangay verification'
            ],
            [
                'firstName' => 'Carmen',
                'lastName' => 'Torres',
                'middleName' => 'Dela Cruz',
                'birthDate' => '1992-09-05',
                'gender' => 'Female',
                'disabilityType' => 'Speech Impairment',
                'address' => '654 Barangay Mamatid, Cabuyao, Laguna',
                'barangay' => 'Mamatid',
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'email' => 'carmen.torres@test.com',
                'contactNumber' => '09123456793',
                'emergencyContact' => 'Benjamin Torres',
                'emergencyPhone' => '09187654325',
                'emergencyRelationship' => 'Father',
                'idType' => 'Passport',
                'idNumber' => 'PP123456789',
                'submissionDate' => now()->subDays(2),
                'status' => 'Pending Admin Approval',
                'remarks' => 'Application requires additional review'
            ]
        ];

        foreach ($testApplications as $appData) {
            Application::create($appData);
            echo "Created test application for: {$appData['firstName']} {$appData['lastName']}\n";
        }

        echo "Created " . count($testApplications) . " test applications\n";
        echo "Applications created with statuses:\n";
        echo "- Pending Admin Approval: " . Application::where('status', 'Pending Admin Approval')->count() . "\n";
        echo "- Pending Barangay Approval: " . Application::where('status', 'Pending Barangay Approval')->count() . "\n";
    }
}