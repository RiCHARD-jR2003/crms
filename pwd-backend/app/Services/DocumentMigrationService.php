<?php

namespace App\Services;

use App\Models\Application;
use App\Models\RequiredDocument;
use App\Models\MemberDocument;
use App\Models\PWDMember;
use Illuminate\Support\Facades\Log;

class DocumentMigrationService
{
    /**
     * Migrate documents from application to member_documents table
     */
    public function migrateApplicationDocuments($application, $pwdUser)
    {
        try {
            Log::info('Starting document migration for application', [
                'application_id' => $application->applicationID,
                'pwd_user_id' => $pwdUser->userID
            ]);

            // Create a mapping of application document fields to required document names
            $documentMapping = [
                'medicalCertificate' => 'Medical Certificate',
                'idPicture' => '2x2 ID Picture',
                'clinicalAbstract' => 'Clinical Abstract',
                'voterCertificate' => 'Voter Certificate',
                'birthCertificate' => 'Birth Certificate',
                'wholeBodyPicture' => 'Whole Body Picture',
                'affidavit' => 'Affidavit of Guardianship',
                'barangayCertificate' => 'Barangay Certificate'
            ];

            $migratedCount = 0;

            // Process each document field
            foreach ($documentMapping as $fieldName => $documentName) {
                if (!empty($application->$fieldName)) {
                    Log::info('Processing document', [
                        'field' => $fieldName,
                        'document_name' => $documentName,
                        'file_path' => $application->$fieldName
                    ]);

                    // Find or create the required document
                    $requiredDocument = RequiredDocument::where('name', $documentName)->first();
                    
                    if (!$requiredDocument) {
                        $requiredDocument = RequiredDocument::create([
                            'name' => $documentName,
                            'description' => $documentName,
                            'is_required' => true,
                            'file_types' => ['pdf', 'jpg', 'jpeg', 'png'],
                            'max_file_size' => 2048,
                            'status' => 'active',
                            'created_by' => 1, // Admin user ID
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                        
                        Log::info('Created required document', [
                            'document_id' => $requiredDocument->id,
                            'document_name' => $documentName
                        ]);
                    }

                    // Check if member document already exists
                    $existingMemberDocument = MemberDocument::where('member_id', $pwdUser->userID)
                        ->where('required_document_id', $requiredDocument->id)
                        ->first();

                    if (!$existingMemberDocument) {
                        // Create member document record
                        $memberDocument = MemberDocument::create([
                            'member_id' => $pwdUser->userID,
                            'required_document_id' => $requiredDocument->id,
                            'file_path' => $application->$fieldName,
                            'file_name' => basename($application->$fieldName),
                            'file_size' => 0, // We don't have the original file size
                            'file_type' => 'application/octet-stream', // Default type
                            'uploaded_at' => $application->submissionDate ?? now(),
                            'status' => 'approved', // Mark as approved since application was approved
                            'reviewed_by' => 1, // Admin user ID
                            'reviewed_at' => now(),
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                        
                        $migratedCount++;
                        Log::info('Document migrated successfully', [
                            'member_id' => $pwdUser->userID,
                            'document' => $documentName,
                            'member_document_id' => $memberDocument->id
                        ]);
                    } else {
                        Log::info('Document already exists, skipping', [
                            'member_id' => $pwdUser->userID,
                            'document' => $documentName
                        ]);
                    }
                }
            }

            Log::info('Document migration completed', [
                'application_id' => $application->applicationID,
                'pwd_user_id' => $pwdUser->userID,
                'migrated_count' => $migratedCount
            ]);

            return [
                'success' => true,
                'migrated_count' => $migratedCount
            ];

        } catch (\Exception $e) {
            Log::error('Document migration failed', [
                'application_id' => $application->applicationID,
                'pwd_user_id' => $pwdUser->userID,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Migrate documents for all approved applications
     */
    public function migrateAllApprovedApplications()
    {
        try {
            Log::info('Starting bulk document migration for all approved applications');

            $approvedApplications = Application::where('status', 'Approved')->get();
            $totalMigrated = 0;
            $totalSkipped = 0;

            foreach ($approvedApplications as $application) {
                // Find the corresponding PWD member
                $pwdMember = PWDMember::where('userID', $application->pwdID)->first();
                
                if (!$pwdMember) {
                    Log::warning('PWD member not found for application', [
                        'application_id' => $application->applicationID,
                        'pwd_id' => $application->pwdID
                    ]);
                    $totalSkipped++;
                    continue;
                }

                $result = $this->migrateApplicationDocuments($application, $pwdMember->user);
                if ($result['success']) {
                    $totalMigrated += $result['migrated_count'];
                } else {
                    $totalSkipped++;
                }
            }

            Log::info('Bulk document migration completed', [
                'total_applications' => $approvedApplications->count(),
                'total_migrated' => $totalMigrated,
                'total_skipped' => $totalSkipped
            ]);

            return [
                'success' => true,
                'total_applications' => $approvedApplications->count(),
                'total_migrated' => $totalMigrated,
                'total_skipped' => $totalSkipped
            ];

        } catch (\Exception $e) {
            Log::error('Bulk document migration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
