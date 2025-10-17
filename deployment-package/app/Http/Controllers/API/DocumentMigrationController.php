<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\RequiredDocument;
use App\Models\MemberDocument;
use App\Models\PWDMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DocumentMigrationController extends Controller
{
    /**
     * Migrate application documents to member documents
     */
    public function migrateApplicationDocuments(Request $request)
    {
        try {
            Log::info('Document migration started', ['user' => $request->user()]);
            
            // Check if user is admin
            if ($request->user()->role !== 'Admin') {
                Log::warning('Unauthorized migration attempt', ['user_role' => $request->user()->role]);
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admins can perform this action.'
                ], 403);
            }

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
            $skippedCount = 0;

            // Get all approved applications
            $approvedApplications = Application::where('status', 'Approved')->get();
            Log::info('Found approved applications', ['count' => $approvedApplications->count()]);

            foreach ($approvedApplications as $application) {
                Log::info('Processing application', ['pwdID' => $application->pwdID]);
                
                // Find the corresponding PWD member
                $pwdMember = PWDMember::where('userID', $application->pwdID)->first();
                
                if (!$pwdMember) {
                    Log::warning('PWD member not found', ['pwdID' => $application->pwdID]);
                    $skippedCount++;
                    continue; // Skip if no PWD member found
                }
                
                Log::info('PWD member found', ['userID' => $pwdMember->userID, 'name' => $pwdMember->firstName . ' ' . $pwdMember->lastName]);

                // Process each document field
                foreach ($documentMapping as $fieldName => $documentName) {
                    if (!empty($application->$fieldName)) {
                        // Find the required document by name
                        $requiredDocument = RequiredDocument::where('name', $documentName)->first();
                        
                        if (!$requiredDocument) {
                            // Create the required document if it doesn't exist
                            $requiredDocument = RequiredDocument::create([
                                'name' => $documentName,
                                'description' => $documentName,
                                'is_required' => true,
                                'file_types' => ['pdf', 'jpg', 'jpeg', 'png'],
                                'max_file_size' => 2048,
                                'status' => 'active',
                                'created_by' => $request->user()->userID,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                        }

                        // Check if member document already exists
                        $existingMemberDocument = MemberDocument::where('member_id', $pwdMember->userID)
                            ->where('required_document_id', $requiredDocument->id)
                            ->first();

                        if (!$existingMemberDocument) {
                            // Create member document record
                            MemberDocument::create([
                                'member_id' => $pwdMember->userID,
                                'required_document_id' => $requiredDocument->id,
                                'file_path' => $application->$fieldName,
                                'file_name' => basename($application->$fieldName),
                                'file_size' => 0, // We don't have the original file size
                                'file_type' => 'application/octet-stream', // Default type
                                'uploaded_at' => $application->submissionDate ?? now(),
                                'status' => 'approved', // Mark as approved since application was approved
                                'reviewed_by' => $request->user()->userID,
                                'reviewed_at' => $application->updated_at ?? now(),
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                            
                            $migratedCount++;
                            Log::info('Document migrated', ['member_id' => $pwdMember->userID, 'document' => $documentName]);
                        } else {
                            Log::info('Document already exists, skipping', ['member_id' => $pwdMember->userID, 'document' => $documentName]);
                        }
                    }
                }
            }

            Log::info('Document migration completed', [
                'migrated_count' => $migratedCount,
                'skipped_count' => $skippedCount,
                'total_applications' => $approvedApplications->count()
            ]);

            $message = 'Document migration completed successfully';
            if ($migratedCount === 0 && $skippedCount === 0) {
                $message = 'No documents found to migrate. All documents may already be migrated.';
            } elseif ($migratedCount === 0) {
                $message = 'No new documents migrated. All documents already exist in the member documents system.';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'migrated_documents' => $migratedCount,
                    'skipped_applications' => $skippedCount,
                    'total_applications_processed' => $approvedApplications->count(),
                    'total_documents_found' => $approvedApplications->sum(function($app) use ($documentMapping) {
                        $count = 0;
                        foreach ($documentMapping as $fieldName => $documentName) {
                            if (!empty($app->$fieldName)) {
                                $count++;
                            }
                        }
                        return $count;
                    })
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Document migration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Document migration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get migration status
     */
    public function getMigrationStatus(Request $request)
    {
        try {
            // Check if user is admin
            if ($request->user()->role !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admins can perform this action.'
                ], 403);
            }

            $approvedApplications = Application::where('status', 'Approved')->count();
            $totalMemberDocuments = MemberDocument::count();
            $requiredDocuments = RequiredDocument::count();

            return response()->json([
                'success' => true,
                'data' => [
                    'approved_applications' => $approvedApplications,
                    'total_member_documents' => $totalMemberDocuments,
                    'required_documents' => $requiredDocuments
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get migration status: ' . $e->getMessage()
            ], 500);
        }
    }
}
