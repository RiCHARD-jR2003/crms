<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Application;
use App\Models\RequiredDocument;
use App\Models\MemberDocument;
use App\Models\PWDMember;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
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

        // Get all approved applications
        $approvedApplications = Application::where('status', 'Approved')->get();

        foreach ($approvedApplications as $application) {
            // Find the corresponding PWD member
            $pwdMember = PWDMember::where('userID', $application->userID)->first();
            
            if (!$pwdMember) {
                continue; // Skip if no PWD member found
            }

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
                            'created_by' => 1, // Admin user ID
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
                            'reviewed_by' => 1, // Admin user ID
                            'reviewed_at' => $application->updated_at ?? now(),
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove member documents that were created from application documents
        // This is a bit tricky since we need to identify which ones were migrated
        // For safety, we'll just remove all member documents created before this migration
        DB::table('member_documents')->where('created_at', '>=', now()->subMinutes(5))->delete();
    }
};
