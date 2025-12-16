<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\PWDMemberController;
use App\Http\Controllers\API\ComplaintController;
use App\Http\Controllers\API\BenefitController;
use App\Http\Controllers\API\BenefitClaimController;
use App\Http\Controllers\API\AnnouncementController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\AuditLogController;
use App\Http\Controllers\API\SecurityMonitoringController;
use App\Http\Controllers\API\SupportTicketController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\GmailController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\DashboardController as MainDashboardController;
use App\Http\Controllers\API\AnalyticsController;
use App\Http\Controllers\API\DocumentManagementController;
use App\Http\Controllers\API\IDRenewalController;
use App\Http\Controllers\API\RenewalController;
use App\Http\Controllers\API\IDClaimController;
use App\Http\Controllers\API\DisabilityAssessmentController;

// Language routes
Route::prefix('language')->group(function () {
    Route::post('/change', [LanguageController::class, 'changeLanguage']);
    Route::get('/current', [LanguageController::class, 'getCurrentLanguage']);
    Route::get('/supported', [LanguageController::class, 'getSupportedLanguages']);
});

// Google Translate routes (commented out - controller needs to be created)
/*
Route::prefix('translate')->group(function () {
    Route::post('/', [TranslateController::class, 'translate']);
    Route::post('/batch', [TranslateController::class, 'translateBatch']);
    Route::post('/detect', [TranslateController::class, 'detectLanguage']);
    Route::post('/section', [TranslateController::class, 'translateSection']);
});
*/

// Public Dashboard routes (working)
Route::get('/dashboard-stats', [MainDashboardController::class, 'getDashboardStats']);
Route::get('/dashboard-monthly', [MainDashboardController::class, 'getMonthlyStats']);
Route::get('/dashboard-activities', [MainDashboardController::class, 'getRecentActivities']);
Route::get('/dashboard-coordination', [MainDashboardController::class, 'getBarangayCoordination']);

// Public disability assessment routes (for applicants)
Route::prefix('public/disability-assessment')->group(function () {
    Route::get('/reference/{referenceNumber}', [DisabilityAssessmentController::class, 'getByReferenceNumber']);
    Route::get('/available-dates', [DisabilityAssessmentController::class, 'getAvailableDates']);
    Route::get('/available-slots/{date}', [DisabilityAssessmentController::class, 'getAvailableSlots']);
    Route::post('/schedule', [DisabilityAssessmentController::class, 'scheduleAssessment']);
    Route::post('/submit/{referenceNumber}', [DisabilityAssessmentController::class, 'submitAssessmentForm']);
    
    // Public rescheduling routes (via email token)
    Route::get('/reschedule/{token}', [DisabilityAssessmentController::class, 'getByRescheduleToken']);
    Route::post('/reschedule', [DisabilityAssessmentController::class, 'rescheduleWithToken']);
});

// Barangay approval route - triggers disability assessment workflow
Route::post('/applications/{applicationId}/barangay-approve', function (Request $request, $applicationId) {
    try {
        // Check if user is barangay president
        $user = $request->user();
        if (!$user || !in_array($user->role, ['BarangayPresident', 'Admin', 'SuperAdmin'])) {
            return response()->json([
                'error' => 'Unauthorized. Barangay President privileges required.'
            ], 403);
        }

        // Find the application
        $application = \App\Models\Application::find($applicationId);
        if (!$application) {
            return response()->json(['error' => 'Application not found'], 404);
        }

        // Check if application is pending barangay approval
        if ($application->status !== 'Pending Barangay Approval') {
            return response()->json([
                'error' => 'Application is not pending barangay approval',
                'current_status' => $application->status
            ], 400);
        }

        // Update application status to For Assessment
        $application->status = 'For Assessment';
        $application->assessment_status = 'pending';
        $application->save();

        // Create disability assessment record and send email
        $assessmentController = new \App\Http\Controllers\API\DisabilityAssessmentController();
        $assessment = $assessmentController->createPendingAssessment($application->applicationID);

        return response()->json([
            'success' => true,
            'message' => 'Application approved by barangay. Application now requires disability assessment. Email sent to applicant with scheduling instructions.',
            'application' => $application,
            'assessment' => $assessment
        ]);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Barangay approval error: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to approve application',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');

// Public application status check route
Route::get('/application-status/{referenceNumber}', function ($referenceNumber) {
    try {
        $application = \App\Models\Application::where('referenceNumber', $referenceNumber)->first();
        
        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }

        // Calculate expiry if not set and application is pending
        try {
            if (!$application->expires_at && in_array($application->status, ['Pending', 'Pending Barangay Approval', 'Pending Admin Approval'])) {
                $application->calculateExpiryDate();
                $application->save();
            }
        } catch (\Exception $e) {
            // If settings table doesn't exist, skip expiry calculation
            \Illuminate\Support\Facades\Log::warning('Could not calculate expiry date, settings table may not exist', [
                'error' => $e->getMessage(),
                'reference_number' => $referenceNumber
            ]);
        }

        // Get remaining time
        $remainingTime = $application->getRemainingTime();
        $remainingHours = $remainingTime ? round($remainingTime / 3600, 1) : null;
        $remainingDays = $remainingTime ? round($remainingTime / 86400, 1) : null;
        
        // Get disability assessment information if exists
        $assessment = \App\Models\DisabilityAssessment::where('application_id', $application->applicationID)->first();
        $assessmentData = null;
        
        if ($assessment) {
            $timeSlots = \App\Models\DisabilityAssessment::getTimeSlots();
            $assessmentData = [
                'reference_number' => $assessment->reference_number,
                'status' => $assessment->status,
                'assessment_date' => $assessment->assessment_date?->format('Y-m-d'),
                'assessment_time' => $timeSlots[$assessment->slot_number] ?? null,
                'slot_number' => $assessment->slot_number,
                'scheduling_email_sent_at' => $assessment->scheduling_email_sent_at?->toDateTimeString(),
                'assessed_at' => $assessment->assessed_at?->toDateTimeString(),
                'finalized_at' => $assessment->finalized_at?->toDateTimeString(),
                'pdf_generated' => !empty($assessment->pdf_path),
                // Missed appointment and rescheduling info
                'is_missed' => $assessment->is_missed ?? false,
                'missed_at' => $assessment->missed_at?->toDateTimeString(),
                'reschedule_count' => $assessment->reschedule_count ?? 0,
                'max_reschedule_allowed' => $assessment->max_reschedule_allowed ?? 1,
                'can_reschedule' => ($assessment->reschedule_count ?? 0) < ($assessment->max_reschedule_allowed ?? 1),
                'original_assessment_date' => $assessment->original_assessment_date?->format('Y-m-d'),
                'attendance_status' => $assessment->attendance_status ?? 'pending',
                'last_rescheduled_at' => $assessment->last_rescheduled_at?->toDateTimeString()
            ];
        }
        
        return response()->json([
            'success' => true,
            'application' => [
                'applicationID' => $application->applicationID,
                'referenceNumber' => $application->referenceNumber,
                'firstName' => $application->firstName,
                'middleName' => $application->middleName,
                'lastName' => $application->lastName,
                'suffix' => $application->suffix,
                'email' => $application->email,
                'status' => $application->status,
                'assessment_status' => $application->assessment_status,
                'submissionDate' => $application->submissionDate,
                'expiresAt' => $application->expires_at?->toDateTimeString(),
                'remainingHours' => $remainingHours,
                'remainingDays' => $remainingDays,
                'isExpired' => $application->isExpired(),
                'remarks' => $application->remarks,
                // Disability assessment information
                'disabilityAssessment' => $assessmentData,
                // Include document paths for rejected applications (allowing re-upload)
                'canReuploadDocuments' => $application->status === 'Rejected',
                'documentFields' => [
                    'medicalCertificate' => $application->medicalCertificate,
                    'clinicalAbstract' => $application->clinicalAbstract,
                    'voterCertificate' => $application->voterCertificate,
                    'idPictures' => $application->idPictures,
                    'birthCertificate' => $application->birthCertificate,
                    'wholeBodyPicture' => $application->wholeBodyPicture,
                    'affidavit' => $application->affidavit,
                    'barangayCertificate' => $application->barangayCertificate
                ]
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error checking application status: ' . $e->getMessage()
        ], 500);
    }
});

// Route to re-upload documents for rejected applications
Route::post('/application-status/{referenceNumber}/reupload-documents', function (Request $request, $referenceNumber) {
    try {
        $application = \App\Models\Application::where('referenceNumber', $referenceNumber)->first();
        
        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }
        
        // Only allow re-upload for rejected applications
        if ($application->status !== 'Rejected') {
            return response()->json([
                'success' => false,
                'message' => 'Documents can only be re-uploaded for rejected applications'
            ], 400);
        }
        
        // Handle file uploads
        $uploadPath = 'uploads/applications/' . date('Y/m/d');
        \Illuminate\Support\Facades\Storage::makeDirectory($uploadPath);
        
        $updatedFields = [];
        
        // Handle each document type
        $documentTypes = [
            'medicalCertificate', 'clinicalAbstract', 'voterCertificate', 
            'birthCertificate', 'wholeBodyPicture', 'affidavit', 'barangayCertificate'
        ];
        
        foreach ($documentTypes as $docType) {
            if ($request->hasFile($docType)) {
                $file = $request->file($docType);
                $fileName = $docType . '_' . time() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs($uploadPath, $fileName, 'public');
                $updatedFields[$docType] = $filePath;
            }
        }
        
        // Handle ID pictures separately (multiple files)
        $idPictures = [];
        for ($i = 0; $i < 2; $i++) {
            if ($request->hasFile("idPicture_$i")) {
                $idPictureFile = $request->file("idPicture_$i");
                $idPictureName = "id_picture_{$i}_" . time() . '.' . $idPictureFile->getClientOriginalExtension();
                $idPicturePath = $idPictureFile->storeAs($uploadPath, $idPictureName, 'public');
                $idPictures[] = $idPicturePath;
            }
        }
        if (!empty($idPictures)) {
            $updatedFields['idPictures'] = json_encode($idPictures);
        }
        
        // Update application with new documents
        if (!empty($updatedFields)) {
            // Update status back to pending after re-upload
            $updatedFields['status'] = 'Pending Barangay Approval';
            $updatedFields['remarks'] = null; // Clear rejection remarks
            $updatedFields['submissionDate'] = now(); // Update submission date
            
            $application->update($updatedFields);
            
            \Illuminate\Support\Facades\Log::info('Documents re-uploaded for rejected application', [
                'application_id' => $application->applicationID,
                'reference_number' => $referenceNumber,
                'updated_fields' => array_keys($updatedFields)
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Documents uploaded successfully. Your application has been resubmitted for review.',
            'application' => $application->fresh()
        ]);
        
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error re-uploading documents', [
            'reference_number' => $referenceNumber,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error uploading documents: ' . $e->getMessage()
        ], 500);
    }
});

// Public user status check route (for troubleshooting login issues)
Route::get('/check-user-status/{email}', function ($email) {
    try {
        $user = \App\Models\User::where('email', $email)->first();
        $application = \App\Models\Application::where('email', $email)->first();
        
        if (!$user && !$application) {
            return response()->json([
                'exists' => false,
                'message' => 'No account or application found with this email address'
            ]);
        }
        
        $response = [
            'email' => $email,
            'user_account' => null,
            'application' => null
        ];
        
        if ($user) {
            $response['user_account'] = [
                'userID' => $user->userID,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at
            ];
        }
        
        if ($application) {
            $response['application'] = [
                'applicationID' => $application->applicationID,
                'firstName' => $application->firstName,
                'lastName' => $application->lastName,
                'email' => $application->email,
                'status' => $application->status,
                'submissionDate' => $application->submissionDate,
                'created_at' => $application->created_at,
                'updated_at' => $application->updated_at
            ];
        }
        
        return response()->json($response);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to check user status',
            'message' => $e->getMessage()
        ], 500);
    }
});






// Get applications by status
Route::get('/applications/status/{status}', function (Request $request, $status) {
    try {
        // Decode the status parameter
        $decodedStatus = urldecode($status);
        
        // Get applications with the specified status
        $applications = \App\Models\Application::where('status', $decodedStatus)->get();
        
        // Add pending correction request status and assessment info to each application
        $applicationsWithCorrections = $applications->map(function ($application) {
            try {
                $pendingCorrection = \App\Models\DocumentCorrectionRequest::where('application_id_string', $application->applicationID)
                    ->where('status', 'pending')
                    ->where('expires_at', '>', now())
                    ->first();
                
                $application->has_pending_correction = $pendingCorrection ? true : false;
                
                // Add assessment information for approval checking
                $assessment = \App\Models\DisabilityAssessment::where('application_id', $application->applicationID)
                    ->orWhere('application_id', $application->id)
                    ->first();
                
                if ($assessment) {
                    $application->assessment_status = $assessment->status;
                    $application->assessment_pdf_path = $assessment->pdf_path;
                } else {
                    $application->assessment_status = null;
                    $application->assessment_pdf_path = null;
                }
            } catch (\Exception $e) {
                // If correction request query fails, just set to false
                \Illuminate\Support\Facades\Log::warning('Failed to check correction request for application', [
                    'application_id' => $application->applicationID,
                    'error' => $e->getMessage()
                ]);
                $application->has_pending_correction = false;
                $application->assessment_status = null;
                $application->assessment_pdf_path = null;
            }
            return $application;
        });
        
        return response()->json($applicationsWithCorrections);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error fetching applications by status', [
            'status' => $status,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
        
        // Return empty array instead of 500 error to prevent frontend crashes
        return response()->json([], 200);
    }
})->middleware('auth:sanctum');

// Get all applications (adjusting for singular table name) - Optimized with caching and eager loading
Route::get('/applications', function () {
    try {
        // Cache for 2 minutes
        $cacheKey = 'applications.all';
        $applications = \Illuminate\Support\Facades\Cache::remember($cacheKey, now()->addMinutes(2), function () {
            // Get all pending correction requests in one query
            $pendingCorrections = \App\Models\DocumentCorrectionRequest::where('status', 'pending')
                ->where('expires_at', '>', now())
                ->pluck('application_id_string')
                ->toArray();
            
            // Get all applications
            $applications = \App\Models\Application::select([
                'applicationID', 'referenceNumber', 'pwdID', 'firstName', 'lastName', 
                'middleName', 'suffix', 'birthDate', 'gender', 'civilStatus', 
                'nationality', 'disabilityType', 'disabilityCause', 'disabilityDate',
                'address', 'barangay', 'city', 'province', 'postalCode', 'email',
                'contactNumber', 'emergencyContact', 'emergencyPhone', 'emergencyRelationship',
                'idType', 'idNumber', 'medicalCertificate', 'clinicalAbstract',
                'voterCertificate', 'idPictures', 'birthCertificate', 'wholeBodyPicture',
                'affidavit', 'barangayCertificate', 'submissionDate', 'status', 'remarks',
                'created_at', 'updated_at'
            ])->get();
            
            // Add pending correction status efficiently
            return $applications->map(function ($application) use ($pendingCorrections) {
                $application->has_pending_correction = in_array((string)$application->applicationID, $pendingCorrections);
                return $application;
            });
        });
        
        return response()->json($applications);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::apiResource('users', 'App\Http\Controllers\API\UserController');
Route::apiResource('complaints', 'App\Http\Controllers\API\ComplaintController');
Route::apiResource('reports', 'App\Http\Controllers\API\ReportController');

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// Public benefit routes (for frontend access)
Route::get('/benefits', [BenefitController::class, 'index']);
Route::get('/benefits/{id}', [BenefitController::class, 'show']);

// Simple benefits routes (used by frontend)
Route::get('/benefits-simple', function () {
    try {
        $benefits = \App\Models\Benefit::all();
        return response()->json($benefits);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::post('/benefits-simple', function (Request $request) {
    try {
        $benefitData = $request->all();
        
        // Set status to Active by default if not provided
        if (!isset($benefitData['status'])) {
            $benefitData['status'] = 'Active';
        }
        
        // Set created_at and updated_at if not provided
        if (!isset($benefitData['created_at'])) {
            $benefitData['created_at'] = now();
        }
        if (!isset($benefitData['updated_at'])) {
            $benefitData['updated_at'] = now();
        }
        
        $benefit = \App\Models\Benefit::create($benefitData);
        
        // Always create draft announcement when benefit is created
        $draftAnnouncementCreated = false;
        try {
            $existingAnnouncement = \App\Models\Announcement::where('benefitID', $benefit->id)->first();
            if (!$existingAnnouncement) {
                // Determine target audience based on selected barangays
                $selectedBarangays = [];
                $targetAudience = 'All Barangays';
                if (isset($benefitData['selectedBarangays']) && is_array($benefitData['selectedBarangays']) && count($benefitData['selectedBarangays']) > 0) {
                    $selectedBarangays = $benefitData['selectedBarangays'];
                    $targetAudience = implode(', ', $selectedBarangays);
                } elseif (isset($benefitData['barangay']) && $benefitData['barangay'] !== 'All' && $benefitData['barangay'] !== 'All Barangays') {
                    $selectedBarangays = [$benefitData['barangay']];
                    $targetAudience = $benefitData['barangay'];
                }
                
                // Generate announcement title
                $benefitType = $benefit->type ?? 'Financial Assistance';
                $barangaysText = count($selectedBarangays) > 0 
                    ? implode(', ', $selectedBarangays) 
                    : 'All Barangays';
                $title = "New {$benefitType} Available for {$barangaysText}";
                
                // Format dates
                $distributionDate = isset($benefitData['distributionDate']) && $benefitData['distributionDate']
                    ? \Carbon\Carbon::parse($benefitData['distributionDate'])
                    : null;
                $expiryDate = isset($benefitData['expiryDate']) && $benefitData['expiryDate']
                    ? \Carbon\Carbon::parse($benefitData['expiryDate'])
                    : null;
                
                // Create draft announcement
                $announcement = \App\Models\Announcement::create([
                    'authorID' => 1, // System/Admin
                    'benefitID' => $benefit->id,
                    'title' => $title,
                    'content' => $benefit->description ?? 'A new benefit program is now available for claiming.',
                    'type' => 'Event',
                    'category' => 'Ayuda Program',
                    'priority' => 'High',
                    'targetAudience' => $targetAudience,
                    'status' => 'Draft', // Created as Draft for barangay president to review and post
                    'publishDate' => now()->toDateString(),
                    'expiryDate' => $expiryDate ? $expiryDate->toDateString() : null,
                    'views' => 0
                ]);
                
                $draftAnnouncementCreated = true;
                
                \Illuminate\Support\Facades\Log::info('Draft announcement created for benefit (simple route)', [
                    'benefit_id' => $benefit->id,
                    'announcement_id' => $announcement->announcementID,
                    'target_audience' => $announcement->targetAudience,
                    'status' => $announcement->status
                ]);
                
                // Clear announcement cache for the target audience to ensure it appears immediately
                $announcementController = app(\App\Http\Controllers\API\AnnouncementController::class);
                $reflection = new \ReflectionClass($announcementController);
                $clearCacheMethod = $reflection->getMethod('clearAnnouncementCache');
                $clearCacheMethod->setAccessible(true);
                $clearCacheMethod->invoke($announcementController, $announcement->targetAudience);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to create draft announcement for benefit (simple route)', [
                'benefit_id' => $benefit->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            // Don't fail benefit creation if announcement creation fails
        }
        
        // Notify Barangay Presidents for each barangay in selectedBarangays
        try {
            $barangaysToNotify = [];
            
            // Collect barangays from selectedBarangays
            if (isset($benefitData['selectedBarangays']) && is_array($benefitData['selectedBarangays'])) {
                $barangaysToNotify = array_merge($barangaysToNotify, $benefitData['selectedBarangays']);
            }
            
            // Also include single barangay if set
            if (isset($benefitData['barangay']) && $benefitData['barangay'] !== 'All' && $benefitData['barangay'] !== 'All Barangays') {
                if (!in_array($benefitData['barangay'], $barangaysToNotify)) {
                    $barangaysToNotify[] = $benefitData['barangay'];
                }
            }
            
            // Remove duplicates
            $barangaysToNotify = array_unique($barangaysToNotify);
            
            // Notify each barangay president
            $notificationService = app(\App\Services\NotificationService::class);
            $notifiedPresidents = [];
            
            foreach ($barangaysToNotify as $barangay) {
                $barangayPresidents = \App\Models\BarangayPresident::where('barangay', $barangay)
                    ->pluck('userID')
                    ->toArray();
                
                foreach ($barangayPresidents as $presidentUserId) {
                    if (!in_array($presidentUserId, $notifiedPresidents)) {
                        $distributionDate = isset($benefitData['distributionDate']) && $benefitData['distributionDate']
                            ? \Carbon\Carbon::parse($benefitData['distributionDate'])->format('M d, Y')
                            : 'To be announced';
                        
                        $notificationService::create(
                            $presidentUserId,
                            'benefit_created',
                            'New Benefit Available for Your Barangay',
                            "A new benefit '{$benefit->title}' ({$benefit->amount}) has been added for {$barangay}. Distribution Date: {$distributionDate}. Please review and announce this benefit to your barangay members.",
                            [
                                'benefit_id' => $benefit->id,
                                'benefit_title' => $benefit->title,
                                'benefit_type' => $benefit->type,
                                'benefit_amount' => $benefit->amount,
                                'barangay' => $barangay,
                                'distribution_date' => $benefit->distributionDate,
                                'expiry_date' => $benefit->expiryDate,
                                'created_at' => $benefit->created_at->toDateTimeString(),
                                'action_required' => 'announce'
                            ],
                            false // Don't notify SuperAdmin about this notification
                        );
                        
                        $notifiedPresidents[] = $presidentUserId;
                    }
                }
            }
            
            \Illuminate\Support\Facades\Log::info('Barangay Presidents notified about new benefit (simple route)', [
                'benefit_id' => $benefit->id,
                'barangays' => $barangaysToNotify,
                'presidents_notified' => count($notifiedPresidents)
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to notify barangay presidents about new benefit (simple route)', [
                'benefit_id' => $benefit->id,
                'error' => $e->getMessage()
            ]);
            // Don't fail benefit creation if notification fails
        }
        
        // Clear ALL benefit caches to ensure new benefit appears
        $statuses = ['Active', 'Pending', 'Inactive', 'Draft', 'all'];
        foreach ($statuses as $status) {
            \Illuminate\Support\Facades\Cache::forget("benefits:index:{$status}:all");
            if (isset($benefitData['barangay']) && $benefitData['barangay']) {
                \Illuminate\Support\Facades\Cache::forget("benefits:index:{$status}:{$benefitData['barangay']}");
            }
            if (isset($benefitData['selectedBarangays']) && is_array($benefitData['selectedBarangays'])) {
                foreach ($benefitData['selectedBarangays'] as $barangay) {
                    \Illuminate\Support\Facades\Cache::forget("benefits:index:{$status}:{$barangay}");
                }
            }
        }
        
        // Also clear the simple benefits route cache if it exists
        \Illuminate\Support\Facades\Cache::forget('benefits-simple');
        
        \Illuminate\Support\Facades\Log::info('Benefit created via simple route', [
            'benefit_id' => $benefit->id,
            'title' => $benefit->title,
            'status' => $benefit->status,
            'draft_announcement_created' => $draftAnnouncementCreated
        ]);
        
        // Return consistent response structure matching BenefitController::store
        return response()->json([
            'success' => true,
            'data' => $benefit,
            'draft_announcement_created' => $draftAnnouncementCreated
        ], 201);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error creating benefit via simple route', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Benefit claims routes
Route::get('/benefit-claims/{benefitId}', function ($benefitId) {
    try {
        $claims = \App\Models\BenefitClaim::where('benefitID', $benefitId)->get();
        return response()->json($claims);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Simple benefits routes
Route::get('/benefits-simple', function () {
    try {
        $benefits = \App\Models\Benefit::all();
        return response()->json($benefits);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::post('/benefits-simple', function (Request $request) {
    try {
        $benefitData = $request->all();
        
        // Set status to Active by default if not provided
        if (!isset($benefitData['status'])) {
            $benefitData['status'] = 'Active';
        }
        
        // Set created_at and updated_at if not provided
        if (!isset($benefitData['created_at'])) {
            $benefitData['created_at'] = now();
        }
        if (!isset($benefitData['updated_at'])) {
            $benefitData['updated_at'] = now();
        }
        
        $benefit = \App\Models\Benefit::create($benefitData);
        
        // Always create draft announcement when benefit is created
        $draftAnnouncementCreated = false;
        try {
            $existingAnnouncement = \App\Models\Announcement::where('benefitID', $benefit->id)->first();
            if (!$existingAnnouncement) {
                // Determine target audience based on selected barangays
                $selectedBarangays = [];
                $targetAudience = 'All Barangays';
                if (isset($benefitData['selectedBarangays']) && is_array($benefitData['selectedBarangays']) && count($benefitData['selectedBarangays']) > 0) {
                    $selectedBarangays = $benefitData['selectedBarangays'];
                    $targetAudience = implode(', ', $selectedBarangays);
                } elseif (isset($benefitData['barangay']) && $benefitData['barangay'] !== 'All' && $benefitData['barangay'] !== 'All Barangays') {
                    $selectedBarangays = [$benefitData['barangay']];
                    $targetAudience = $benefitData['barangay'];
                }
                
                // Generate announcement title
                $benefitType = $benefit->type ?? 'Financial Assistance';
                $barangaysText = count($selectedBarangays) > 0 
                    ? implode(', ', $selectedBarangays) 
                    : 'All Barangays';
                $title = "New {$benefitType} Available for {$barangaysText}";
                
                // Format dates
                $distributionDate = isset($benefitData['distributionDate']) && $benefitData['distributionDate']
                    ? \Carbon\Carbon::parse($benefitData['distributionDate'])
                    : null;
                $expiryDate = isset($benefitData['expiryDate']) && $benefitData['expiryDate']
                    ? \Carbon\Carbon::parse($benefitData['expiryDate'])
                    : null;
                
                // Create draft announcement
                $announcement = \App\Models\Announcement::create([
                    'authorID' => 1, // System/Admin
                    'benefitID' => $benefit->id,
                    'title' => $title,
                    'content' => $benefit->description ?? 'A new benefit program is now available for claiming.',
                    'type' => 'Event',
                    'category' => 'Ayuda Program',
                    'priority' => 'High',
                    'targetAudience' => $targetAudience,
                    'status' => 'Draft', // Created as Draft for barangay president to review and post
                    'publishDate' => now()->toDateString(),
                    'expiryDate' => $expiryDate ? $expiryDate->toDateString() : null,
                    'views' => 0
                ]);
                
                $draftAnnouncementCreated = true;
                
                \Illuminate\Support\Facades\Log::info('Draft announcement created for benefit (simple route)', [
                    'benefit_id' => $benefit->id,
                    'announcement_id' => $announcement->announcementID,
                    'target_audience' => $announcement->targetAudience,
                    'status' => $announcement->status
                ]);
                
                // Clear announcement cache for the target audience to ensure it appears immediately
                $announcementController = app(\App\Http\Controllers\API\AnnouncementController::class);
                $reflection = new \ReflectionClass($announcementController);
                $clearCacheMethod = $reflection->getMethod('clearAnnouncementCache');
                $clearCacheMethod->setAccessible(true);
                $clearCacheMethod->invoke($announcementController, $announcement->targetAudience);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to create draft announcement for benefit (simple route)', [
                'benefit_id' => $benefit->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            // Don't fail benefit creation if announcement creation fails
        }
        
        // Notify Barangay Presidents for each barangay in selectedBarangays
        try {
            $barangaysToNotify = [];
            
            // Collect barangays from selectedBarangays
            if (isset($benefitData['selectedBarangays']) && is_array($benefitData['selectedBarangays'])) {
                $barangaysToNotify = array_merge($barangaysToNotify, $benefitData['selectedBarangays']);
            }
            
            // Also include single barangay if set
            if (isset($benefitData['barangay']) && $benefitData['barangay'] !== 'All' && $benefitData['barangay'] !== 'All Barangays') {
                if (!in_array($benefitData['barangay'], $barangaysToNotify)) {
                    $barangaysToNotify[] = $benefitData['barangay'];
                }
            }
            
            // Remove duplicates
            $barangaysToNotify = array_unique($barangaysToNotify);
            
            // Notify each barangay president
            $notificationService = app(\App\Services\NotificationService::class);
            $notifiedPresidents = [];
            
            foreach ($barangaysToNotify as $barangay) {
                $barangayPresidents = \App\Models\BarangayPresident::where('barangay', $barangay)
                    ->pluck('userID')
                    ->toArray();
                
                foreach ($barangayPresidents as $presidentUserId) {
                    if (!in_array($presidentUserId, $notifiedPresidents)) {
                        $distributionDate = isset($benefitData['distributionDate']) && $benefitData['distributionDate']
                            ? \Carbon\Carbon::parse($benefitData['distributionDate'])->format('M d, Y')
                            : 'To be announced';
                        
                        $notificationService::create(
                            $presidentUserId,
                            'benefit_created',
                            'New Benefit Available for Your Barangay',
                            "A new benefit '{$benefit->title}' ({$benefit->amount}) has been added for {$barangay}. Distribution Date: {$distributionDate}. Please review and announce this benefit to your barangay members.",
                            [
                                'benefit_id' => $benefit->id,
                                'benefit_title' => $benefit->title,
                                'benefit_type' => $benefit->type,
                                'benefit_amount' => $benefit->amount,
                                'barangay' => $barangay,
                                'distribution_date' => $benefit->distributionDate,
                                'expiry_date' => $benefit->expiryDate,
                                'created_at' => $benefit->created_at->toDateTimeString(),
                                'action_required' => 'announce'
                            ],
                            false // Don't notify SuperAdmin about this notification
                        );
                        
                        $notifiedPresidents[] = $presidentUserId;
                    }
                }
            }
            
            \Illuminate\Support\Facades\Log::info('Barangay Presidents notified about new benefit (simple route)', [
                'benefit_id' => $benefit->id,
                'barangays' => $barangaysToNotify,
                'presidents_notified' => count($notifiedPresidents)
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to notify barangay presidents about new benefit (simple route)', [
                'benefit_id' => $benefit->id,
                'error' => $e->getMessage()
            ]);
            // Don't fail benefit creation if notification fails
        }
        
        // Clear ALL benefit caches to ensure new benefit appears
        $statuses = ['Active', 'Pending', 'Inactive', 'Draft', 'all'];
        foreach ($statuses as $status) {
            \Illuminate\Support\Facades\Cache::forget("benefits:index:{$status}:all");
            if (isset($benefitData['barangay']) && $benefitData['barangay']) {
                \Illuminate\Support\Facades\Cache::forget("benefits:index:{$status}:{$benefitData['barangay']}");
            }
            if (isset($benefitData['selectedBarangays']) && is_array($benefitData['selectedBarangays'])) {
                foreach ($benefitData['selectedBarangays'] as $barangay) {
                    \Illuminate\Support\Facades\Cache::forget("benefits:index:{$status}:{$barangay}");
                }
            }
        }
        
        // Also clear the simple benefits route cache if it exists
        \Illuminate\Support\Facades\Cache::forget('benefits-simple');
        
        \Illuminate\Support\Facades\Log::info('Benefit created via simple route', [
            'benefit_id' => $benefit->id,
            'title' => $benefit->title,
            'status' => $benefit->status,
            'draft_announcement_created' => $draftAnnouncementCreated
        ]);
        
        // Return consistent response structure matching BenefitController::store
        return response()->json([
            'success' => true,
            'data' => $benefit,
            'draft_announcement_created' => $draftAnnouncementCreated
        ], 201);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error creating benefit via simple route', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::put('/benefits-simple/{id}', function (Request $request, $id) {
    try {
        $benefit = \App\Models\Benefit::find($id);
        if (!$benefit) {
            return response()->json(['error' => 'Benefit not found'], 404);
        }
        $benefit->update($request->all());
        return response()->json($benefit);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::delete('/benefits-simple/{id}', function ($id) {
    try {
        $benefit = \App\Models\Benefit::find($id);
        if (!$benefit) {
            return response()->json(['error' => 'Benefit not found'], 404);
        }
        $benefit->delete();
        return response()->json(['message' => 'Benefit deleted successfully']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Benefit claims routes
Route::get('/benefit-claims/{benefitId}', function ($benefitId) {
    try {
        $claims = \App\Models\BenefitClaim::where('benefitID', $benefitId)->get();
        return response()->json($claims);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::post('/benefit-claims', function (Request $request) {
    try {
        $claim = \App\Models\BenefitClaim::create($request->all());
        return response()->json($claim, 201);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Public announcements route - PWD members need to see announcements
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/announcements/admin', [AnnouncementController::class, 'getAdminAnnouncements']);
Route::get('/announcements/audience/{audience}', [AnnouncementController::class, 'getByAudience']);
Route::get('/announcements/{id}', [AnnouncementController::class, 'show']);

// Public benefit claim routes for QR scanner
Route::get('/benefit-claims', [BenefitClaimController::class, 'index']);
Route::post('/benefit-claims', [BenefitClaimController::class, 'store']);
Route::patch('/benefit-claims/{id}/status', [BenefitClaimController::class, 'updateStatus']);
Route::get('/benefit-claims/{id}/treasury-letter', [BenefitClaimController::class, 'downloadTreasuryLetter']);
Route::post('/benefit-claims/{id}/upload-signed-letter', [BenefitClaimController::class, 'uploadSignedLetter']);
Route::get('/benefit-claims/{id}/signed-letter', [BenefitClaimController::class, 'viewSignedLetter']);

// QR scan claim benefits route
Route::post('/qr-scan/claim-benefits', [BenefitClaimController::class, 'claimBenefits']);

// QR code decryption endpoint (for scanning encrypted QR codes)
Route::post('/qr-code/decrypt', function (Request $request) {
    try {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'encryptedData' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid request',
                'errors' => $validator->errors()
            ], 400);
        }

        $encryptedData = $request->encryptedData;
        
        // Decrypt and validate the QR code
        $decryptedData = \App\Services\QRCodeGenerator::validateAndDecryptQRData($encryptedData);
        
        return response()->json([
            'success' => true,
            'data' => $decryptedData
        ]);
        
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('QR code decryption failed: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'error' => 'Failed to decrypt QR code',
            'message' => $e->getMessage()
        ], 400);
    }
});

// PWD Member profile routes
Route::get('/pwd-member/profile', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user || $user->role !== 'PWDMember') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $pwdMember = $user->pwdMember;
        if (!$pwdMember) {
            return response()->json(['error' => 'PWD Member not found'], 404);
        }
        
        // Get barangay from approved application, or from any application, or from PWDMember model
        $approvedApplication = $pwdMember->applications()
            ->where('status', 'Approved')
            ->latest()
            ->first();
        
        // If no approved application, try to get barangay from any application
        $barangay = null;
        if ($approvedApplication) {
            $barangay = $approvedApplication->barangay;
        } else {
            // Try to get from any application
            $anyApplication = $pwdMember->applications()->latest()->first();
            if ($anyApplication && $anyApplication->barangay) {
                $barangay = $anyApplication->barangay;
            }
        }
        
        // If still no barangay, try to get from PWDMember model directly
        if (!$barangay && $pwdMember->barangay) {
            $barangay = $pwdMember->barangay;
        }
        
        // Ensure QR code is generated if it doesn't exist
        if (empty($pwdMember->qr_code_data)) {
            try {
                \App\Services\QRCodeGenerator::generateAndStore($pwdMember);
                $pwdMember->refresh(); // Refresh to get the newly generated QR code data
            } catch (\Exception $qrError) {
                \Illuminate\Support\Facades\Log::error('QR code generation failed in profile endpoint', [
                    'error' => $qrError->getMessage(),
                    'pwd_member_id' => $pwdMember->userID
                ]);
            }
        }
        
        $profile = [
            'userID' => $user->userID,
            'firstName' => $pwdMember->firstName,
            'lastName' => $pwdMember->lastName,
            'email' => $user->email,
            'contactNumber' => $pwdMember->contactNumber,
            'address' => $pwdMember->address,
            'birthDate' => $pwdMember->birthDate,
            'gender' => $pwdMember->gender,
            'disabilityType' => $pwdMember->disabilityType,
            'pwd_id' => $pwdMember->pwd_id,
            'barangay' => $barangay,
            'created_at' => $pwdMember->created_at,
            'qr_code_data' => $pwdMember->qr_code_data,
            'qr_code_generated_at' => $pwdMember->qr_code_generated_at,
        ];
        
        return response()->json($profile);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::put('/pwd-member/profile', function (Request $request) {
    try {
        $user = $request->user();
        if (!$user || $user->role !== 'PWDMember') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $pwdMember = $user->pwdMember;
        if (!$pwdMember) {
            return response()->json(['error' => 'PWD Member not found'], 404);
        }
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'firstName' => 'required|string|max:50',
            'lastName' => 'required|string|max:50',
            'email' => 'required|email',
            'contactNumber' => 'required|string|max:20',
            'address' => 'required|string',
            'birthDate' => 'required|date',
            'gender' => 'required|string',
            'disabilityType' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['error' => 'Validation failed', 'messages' => $validator->errors()], 422);
        }
        
        // Update user email
        $user->update(['email' => $request->email]);
        
        // Update PWD member data
        $pwdMember->update([
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'contactNumber' => $request->contactNumber,
            'address' => $request->address,
            'birthDate' => $request->birthDate,
            'gender' => $request->gender,
            'disabilityType' => $request->disabilityType,
        ]);
        
        return response()->json(['message' => 'Profile updated successfully']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


// Public route to get active required documents for application form
Route::get('/documents/public', [App\Http\Controllers\API\DocumentManagementController::class, 'getPublicDocuments']);

// Public route to check for duplicate applications before submission
Route::post('/applications/check-duplicates', function (Request $request) {
    try {
        $validationService = new \App\Services\ApplicationValidationService();
        $duplicates = $validationService->checkForDuplicates($request->all());
        
        return response()->json([
            'has_duplicates' => !empty($duplicates),
            'duplicates' => $duplicates,
            'message' => empty($duplicates) ? 'No duplicates found. You can proceed with your application.' : 'Duplicate applications detected.'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to check for duplicates',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Email verification routes
Route::post('/send-verification-code', function (Request $request) {
    try {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'email' => 'required|email',
            'purpose' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $purpose = $request->purpose ?? 'application_submission';

        // Create verification record
        $verification = \App\Models\EmailVerification::createVerification($email, $purpose);

        // Send email
        \Illuminate\Support\Facades\Mail::send('emails.verification-code', [
            'verificationCode' => $verification->verification_code
        ], function ($message) use ($email) {
            $message->to($email)
                   ->subject('PWD Application - Email Verification Code')
                   ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
        });

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent successfully',
            'expires_in_minutes' => 10
        ]);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Failed to send verification code', [
            'error' => $e->getMessage(),
            'email' => $request->email ?? 'unknown'
        ]);

        return response()->json([
            'error' => 'Failed to send verification code',
            'message' => 'Please try again later'
        ], 500);
    }
});

Route::post('/verify-code', function (Request $request) {
    try {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'purpose' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $code = $request->code;
        $purpose = $request->purpose ?? 'application_submission';

        // Check if code exists and is valid (but don't mark as used yet)
        $verification = \App\Models\EmailVerification::where('email', $email)
            ->where('verification_code', $code)
            ->where('purpose', $purpose)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($verification) {
            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully'
            ]);
        } else {
            return response()->json([
                'error' => 'Invalid verification code',
                'message' => 'The verification code is invalid, expired, or already used'
            ], 400);
        }

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Failed to verify code', [
            'error' => $e->getMessage(),
            'email' => $request->email ?? 'unknown'
        ]);

        return response()->json([
            'error' => 'Failed to verify code',
            'message' => 'Please try again later'
        ], 500);
    }
});


// Document correction request route
Route::post('/applications/correction-request', function (Request $request) {
    try {
        // Log the incoming request for debugging
        \Illuminate\Support\Facades\Log::info('Correction request received', [
            'request_data' => $request->all(),
            'has_applicationId' => $request->has('applicationId'),
            'has_documentsToCorrect' => $request->has('documentsToCorrect'),
            'has_notes' => $request->has('notes'),
            'has_requestedBy' => $request->has('requestedBy'),
            'has_requestedByName' => $request->has('requestedByName'),
            'documentsToCorrect_count' => is_array($request->documentsToCorrect) ? count($request->documentsToCorrect) : 'not_array'
        ]);

        try {
            $request->validate([
                'applicationId' => 'required|string',
                'documentsToCorrect' => 'required|array|min:1',
                'notes' => 'nullable|string|max:1000',
                'requestedBy' => 'required|string',
                'requestedByName' => 'required|string'
            ]);
            \Illuminate\Support\Facades\Log::info('Validation passed for correction request');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Validation failed for correction request', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        }

        // Convert empty string notes to null
        $notes = $request->notes === '' ? null : $request->notes;

        // Find the application
        $application = \App\Models\Application::where('applicationID', $request->applicationId)->first();
        if (!$application) {
            \Illuminate\Support\Facades\Log::error('Application not found for correction request', [
                'applicationId' => $request->applicationId,
                'request_data' => $request->all(),
                'available_applications' => \App\Models\Application::pluck('applicationID')->toArray()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Application not found',
                'message' => 'The application you are trying to correct does not exist. Please refresh the page and try again.'
            ], 404);
        }

        \Illuminate\Support\Facades\Log::info('Application found for correction request', [
            'applicationId' => $request->applicationId,
            'application_name' => $application->firstName . ' ' . $application->lastName,
            'application_email' => $application->email
        ]);

        // Create correction request record
        try {
            $correctionRequest = \App\Models\DocumentCorrectionRequest::create([
                'application_id_string' => $request->applicationId,
                'documents_to_correct' => json_encode($request->documentsToCorrect),
                'notes' => $notes,
                'requested_by' => $request->requestedBy,
                'requested_by_name' => $request->requestedByName,
                'status' => 'pending',
                'correction_token' => \Illuminate\Support\Str::random(32),
                'expires_at' => now()->addDays(7) // Token expires in 7 days
            ]);

            \Illuminate\Support\Facades\Log::info('Correction request created successfully', [
                'correction_request_id' => $correctionRequest->id,
                'application_id' => $request->applicationId,
                'token' => $correctionRequest->correction_token
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to create correction request', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to create correction request: ' . $e->getMessage()
            ], 500);
        }

        // Send email notification to applicant
        try {
            \App\Services\EmailService::sendCorrectionRequestEmail(
                $application->email,
                $application->firstName . ' ' . $application->lastName,
                $request->documentsToCorrect,
                $notes,
                $correctionRequest->correction_token
            );
        } catch (\Exception $emailError) {
            \Illuminate\Support\Facades\Log::error('Failed to send correction request email', [
                'application_id' => $request->applicationId,
                'error' => $emailError->getMessage()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Correction request created successfully',
            'correction_request_id' => $correctionRequest->id
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error creating correction request', [
            'error' => $e->getMessage(),
            'request_data' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'error' => 'Failed to create correction request'
        ], 500);
    }
});

// Update application status route (used by barangay for document resubmission requests)
Route::put('/applications/{applicationId}/status', function (Request $request, $applicationId) {
    try {
        $request->validate([
            'status' => 'required|string'
        ]);

        $application = \App\Models\Application::where('applicationID', $applicationId)->first();
        
        if (!$application) {
            return response()->json([
                'success' => false,
                'error' => 'Application not found'
            ], 404);
        }

        // Update application status
        $previousStatus = $application->status;
        $application->status = $request->status;
        $application->save();

        \Illuminate\Support\Facades\Log::info('Application status updated', [
            'applicationId' => $applicationId,
            'previousStatus' => $previousStatus,
            'newStatus' => $request->status
        ]);

        // Clear application cache
        \Illuminate\Support\Facades\Cache::forget('applications.all');

        return response()->json([
            'success' => true,
            'message' => 'Application status updated successfully',
            'application' => [
                'applicationID' => $application->applicationID,
                'status' => $application->status,
                'previousStatus' => $previousStatus
            ]
        ]);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error updating application status', [
            'applicationId' => $applicationId,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'success' => false,
            'error' => 'Failed to update application status: ' . $e->getMessage()
        ], 500);
    }
})->middleware('auth:sanctum');

// Get correction request by token (public endpoint, no auth required)
Route::get('/applications/correction-request/{token}', function ($token) {
    try {
        \Illuminate\Support\Facades\Log::info('Fetching correction request', [
            'token' => $token,
            'token_length' => strlen($token)
        ]);
        
        // First, try to find pending and not expired correction request
        $correctionRequest = \App\Models\DocumentCorrectionRequest::where('correction_token', $token)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        // If not found, check if it exists but is completed or expired
        if (!$correctionRequest) {
            $existingRequest = \App\Models\DocumentCorrectionRequest::where('correction_token', $token)->first();
            
            \Illuminate\Support\Facades\Log::warning('Correction request not found or invalid', [
                'token' => $token,
                'exists' => $existingRequest ? true : false,
                'status_if_exists' => $existingRequest ? $existingRequest->status : null,
                'expires_at_if_exists' => $existingRequest ? $existingRequest->expires_at : null,
                'is_expired' => $existingRequest && $existingRequest->expires_at ? $existingRequest->expires_at->isPast() : null
            ]);
            
            if ($existingRequest) {
                if ($existingRequest->status === 'completed') {
            return response()->json([
                'success' => false,
                        'message' => 'This correction request has already been completed. If you need to make additional corrections, please contact support.',
                        'status' => 'completed'
                    ], 404);
                } elseif ($existingRequest->expires_at && $existingRequest->expires_at->isPast()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This correction request has expired. Please request a new correction link from the administrator.',
                        'status' => 'expired'
                    ], 404);
                }
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired correction request. Please check your link or contact support.'
            ], 404);
        }

        // Find the application
        $application = \App\Models\Application::where('applicationID', $correctionRequest->application_id_string)->first();
        if (!$application) {
            \Illuminate\Support\Facades\Log::error('Application not found for correction request', [
                'token' => $token,
                'application_id_string' => $correctionRequest->application_id_string
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }

        \Illuminate\Support\Facades\Log::info('Correction request found successfully', [
            'token' => $token,
            'correction_request_id' => $correctionRequest->id,
            'application_id' => $application->applicationID
        ]);

        return response()->json([
            'success' => true,
            'correction_request' => $correctionRequest,
            'application' => $application
        ]);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error fetching correction request', [
            'token' => $token,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch correction request: ' . $e->getMessage()
        ], 500);
    }
});

// Handle OPTIONS preflight for submit-corrections (important for mobile browsers)
Route::options('/applications/submit-corrections', function () {
    return response()->json([], 200)->withHeaders([
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age' => '86400',
    ]);
});

// Submit document corrections
Route::post('/applications/submit-corrections', function (Request $request) {
    try {
        \Illuminate\Support\Facades\Log::info('Document correction submission received', [
            'has_correction_token' => $request->has('correction_token'),
            'correction_token' => $request->input('correction_token'),
            'has_files' => $request->hasFile('medicalCertificate') || $request->hasFile('idPictures') || $request->hasFile('barangayCertificate'),
            'user_agent' => $request->header('User-Agent'),
            'origin' => $request->header('Origin'),
            'content_type' => $request->header('Content-Type'),
            'content_length' => $request->header('Content-Length'),
            'request_method' => $request->method()
        ]);
        
        $request->validate([
            'correction_token' => 'required|string|size:32',
            'medicalCertificate' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:15360',
            'clinicalAbstract' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:15360',
            'voterCertificate' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:15360',
            'idPictures' => 'nullable|file|mimes:jpeg,png,jpg|max:15360',
            'birthCertificate' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:15360',
            'wholeBodyPicture' => 'nullable|file|mimes:jpeg,png,jpg|max:15360',
            'affidavit' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:15360',
            'barangayCertificate' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:15360'
        ]);

        // Find the correction request
        $correctionRequest = \App\Models\DocumentCorrectionRequest::where('correction_token', $request->correction_token)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if (!$correctionRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid, expired, or completed correction request'
            ], 404);
        }

        // Find the application
        $application = \App\Models\Application::where('applicationID', $correctionRequest->application_id_string)->first();
        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }

        // Process file uploads
        $uploadedFiles = [];
        $documentsToCorrect = json_decode($correctionRequest->documents_to_correct, true);
        
        // Use the same storage path structure as original application
        $uploadPath = 'uploads/applications/' . date('Y/m/d');
        \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory($uploadPath);

        // Get all uploaded files once for efficiency
        $allFiles = $request->allFiles();
        
        \Illuminate\Support\Facades\Log::info('Processing document corrections', [
            'documents_to_correct' => $documentsToCorrect,
            'all_uploaded_files' => array_keys($allFiles)
        ]);

        foreach ($documentsToCorrect as $docType) {
            // Handle all documents the same way (including idPictures)
            // Support both direct file name and array notation for backward compatibility
            $file = null;
            
            // Try direct file name first (standard way)
            if (isset($allFiles[$docType]) || $request->hasFile($docType)) {
                $file = isset($allFiles[$docType]) ? $allFiles[$docType] : $request->file($docType);
            }
            // For idPictures, also check array notation (idPictures[0]) for backward compatibility
            elseif ($docType === 'idPictures') {
                if (isset($allFiles['idPictures']) && is_array($allFiles['idPictures']) && !empty($allFiles['idPictures'])) {
                    $file = $allFiles['idPictures'][0];
                } elseif (isset($allFiles['idPictures.0'])) {
                    $file = $allFiles['idPictures.0'];
                } elseif ($request->hasFile('idPictures.0')) {
                    $file = $request->file('idPictures.0');
                }
            }
            
            if ($file && $file->isValid()) {
                // Delete old file if it exists
                // Handle both string (new format) and array (old format) for backward compatibility
                $oldFilePath = $application->$docType;
                if ($oldFilePath) {
                    // If it's stored as array (old format), get first element
                    if (is_array($oldFilePath)) {
                        $oldFilePath = !empty($oldFilePath) ? $oldFilePath[0] : null;
                    } elseif (is_string($oldFilePath) && (strpos($oldFilePath, '[') === 0 || strpos($oldFilePath, '"') === 0)) {
                        // Try to decode if it's a JSON string
                        $decoded = json_decode($oldFilePath, true);
                        if (is_array($decoded) && !empty($decoded)) {
                            $oldFilePath = $decoded[0];
                        }
                    }
                    
                    if ($oldFilePath) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($oldFilePath);
                    }
                }
                
                // Generate filename based on document type
                $fileNamePrefix = match($docType) {
                    'medicalCertificate' => 'medical_cert',
                    'clinicalAbstract' => 'clinical_abstract',
                    'voterCertificate' => 'voter_certificate',
                    'birthCertificate' => 'birth_certificate',
                    'wholeBodyPicture' => 'whole_body_picture',
                    'affidavit' => 'affidavit',
                    'barangayCertificate' => 'barangay_certificate',
                    'idPictures' => 'id_picture',
                    default => $docType
                };
                
                // Use microtime for more unique filenames to avoid collisions
                $uniqueId = str_replace('.', '', microtime(true));
                $fileName = $fileNamePrefix . '_' . $uniqueId . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs($uploadPath, $fileName, 'public');
                $uploadedFiles[$docType] = $filePath;
                
                \Illuminate\Support\Facades\Log::info('Processed file for correction', [
                    'doc_type' => $docType,
                    'file_path' => $filePath,
                    'old_file_path' => $oldFilePath,
                    'original_name' => $file->getClientOriginalName(),
                    'file_deleted' => $oldFilePath ? \Illuminate\Support\Facades\Storage::disk('public')->exists($oldFilePath) ? 'not_deleted' : 'deleted' : 'no_old_file'
                ]);
            } else {
                \Illuminate\Support\Facades\Log::warning('File not valid or not found', [
                    'doc_type' => $docType,
                    'has_file_in_allFiles' => isset($allFiles[$docType]),
                    'has_file_in_request' => $request->hasFile($docType)
                ]);
            }
        }

        // Log what we're about to update
        \Illuminate\Support\Facades\Log::info('About to update application with files', [
            'application_id' => $application->applicationID,
            'uploaded_files' => $uploadedFiles,
            'uploaded_files_keys' => array_keys($uploadedFiles),
            'current_medicalCertificate' => $application->medicalCertificate,
            'current_idPictures' => $application->idPictures,
            'current_barangayCertificate' => $application->barangayCertificate
        ]);

        // Update application with new files
        $updateResult = $application->update($uploadedFiles);
        
        // Refresh the model to get the latest data
        $application->refresh();

        // Log what was actually saved
        \Illuminate\Support\Facades\Log::info('Application updated with files', [
            'application_id' => $application->applicationID,
            'update_result' => $updateResult,
            'updated_medicalCertificate' => $application->medicalCertificate,
            'updated_idPictures' => $application->idPictures,
            'updated_barangayCertificate' => $application->barangayCertificate,
            'was_changed' => $application->wasChanged()
        ]);

        // Mark correction request as completed
        $correctionRequest->markAsCompleted();

        // Log the correction submission
        \Illuminate\Support\Facades\Log::info('Document corrections submitted', [
            'application_id' => $application->applicationID,
            'correction_request_id' => $correctionRequest->id,
            'documents_corrected' => $documentsToCorrect,
            'uploaded_files' => array_keys($uploadedFiles)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document corrections submitted successfully'
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error submitting document corrections', [
            'token' => $request->correction_token,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to submit corrections'
        ], 500);
    }
});

// Public application submission route
Route::post('/applications', function (Request $request) {
    try {
        // Log the incoming request for debugging
        \Illuminate\Support\Facades\Log::info('Application submission attempt', [
            'request_data' => $request->all(),
            'has_files' => $request->hasFile('medicalCertificate') || $request->hasFile('barangayCertificate')
        ]);

        // Check email verification first
        $email = $request->email;
        $verificationCode = $request->verification_code;
        
        if (!$email || !$verificationCode) {
            return response()->json([
                'error' => 'Email verification required',
                'message' => 'Please verify your email address before submitting the application'
            ], 400);
        }

        // Verify the email code
        $isVerified = \App\Models\EmailVerification::verifyCode($email, $verificationCode, 'application_submission');
        
        if (!$isVerified) {
            return response()->json([
                'error' => 'Email verification failed',
                'message' => 'Invalid or expired verification code. Please request a new code.'
            ], 400);
        }

        // Use the validation service for comprehensive duplicate checking
        $validationService = new \App\Services\ApplicationValidationService();
        
        // First, check for duplicates before validation
        $duplicates = $validationService->checkForDuplicates($request->all());
        if (!empty($duplicates)) {
            \Illuminate\Support\Facades\Log::warning('Duplicate application detected', [
                'duplicates' => $duplicates,
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'error' => 'Duplicate application detected',
                'message' => 'An application with similar information already exists.',
                'duplicates' => $duplicates,
                'suggestions' => [
                    'Check your existing application status',
                    'Contact support if you believe this is an error',
                    'Use a different email address if this is for a different person'
                ]
            ], 409); // 409 Conflict
        }

        // Get validation rules from service
        $rules = $validationService->getValidationRules();
        $messages = $validationService->getValidationMessages();
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('Application validation failed', [
                'errors' => $validator->errors()
            ]);
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['status'] = 'Pending Barangay Approval';
        $data['submissionDate'] = now();
        
        // Normalize middleName: if empty or whitespace, set to "N/A"
        if (empty($data['middleName']) || trim($data['middleName']) === '') {
            $data['middleName'] = 'N/A';
        } else {
            $data['middleName'] = trim($data['middleName']);
        }

        // Handle file uploads
        $uploadPath = 'uploads/applications/' . date('Y/m/d');
        \Illuminate\Support\Facades\Storage::makeDirectory($uploadPath);


        if ($request->hasFile('medicalCertificate')) {
            $medicalFile = $request->file('medicalCertificate');
            $medicalName = 'medical_cert_' . time() . '.' . $medicalFile->getClientOriginalExtension();
            $medicalPath = $medicalFile->storeAs($uploadPath, $medicalName, 'public');
            $data['medicalCertificate'] = $medicalPath;
        }


        // Handle new document fields
        if ($request->hasFile('clinicalAbstract')) {
            $clinicalFile = $request->file('clinicalAbstract');
            $clinicalName = 'clinical_abstract_' . time() . '.' . $clinicalFile->getClientOriginalExtension();
            $clinicalPath = $clinicalFile->storeAs($uploadPath, $clinicalName, 'public');
            $data['clinicalAbstract'] = $clinicalPath;
        }

        if ($request->hasFile('voterCertificate')) {
            $voterFile = $request->file('voterCertificate');
            $voterName = 'voter_certificate_' . time() . '.' . $voterFile->getClientOriginalExtension();
            $voterPath = $voterFile->storeAs($uploadPath, $voterName, 'public');
            $data['voterCertificate'] = $voterPath;
        }

        // Handle ID picture (single file, same as other documents)
        if ($request->hasFile('idPictures') || $request->hasFile('idPicture_0')) {
            $idPictureFile = $request->hasFile('idPictures') 
                ? $request->file('idPictures') 
                : $request->file('idPicture_0');
            $idPictureName = 'id_picture_' . time() . '.' . $idPictureFile->getClientOriginalExtension();
                $idPicturePath = $idPictureFile->storeAs($uploadPath, $idPictureName, 'public');
            $data['idPictures'] = $idPicturePath;
        }

        if ($request->hasFile('birthCertificate')) {
            $birthFile = $request->file('birthCertificate');
            $birthName = 'birth_certificate_' . time() . '.' . $birthFile->getClientOriginalExtension();
            $birthPath = $birthFile->storeAs($uploadPath, $birthName, 'public');
            $data['birthCertificate'] = $birthPath;
        }

        if ($request->hasFile('wholeBodyPicture')) {
            $wholeBodyFile = $request->file('wholeBodyPicture');
            $wholeBodyName = 'whole_body_picture_' . time() . '.' . $wholeBodyFile->getClientOriginalExtension();
            $wholeBodyPath = $wholeBodyFile->storeAs($uploadPath, $wholeBodyName, 'public');
            $data['wholeBodyPicture'] = $wholeBodyPath;
        }

        if ($request->hasFile('affidavit')) {
            $affidavitFile = $request->file('affidavit');
            $affidavitName = 'affidavit_' . time() . '.' . $affidavitFile->getClientOriginalExtension();
            $affidavitPath = $affidavitFile->storeAs($uploadPath, $affidavitName, 'public');
            $data['affidavit'] = $affidavitPath;
        }

        if ($request->hasFile('barangayCertificate')) {
            $barangayCertFile = $request->file('barangayCertificate');
            $barangayCertName = 'barangay_certificate_' . time() . '.' . $barangayCertFile->getClientOriginalExtension();
            $barangayCertPath = $barangayCertFile->storeAs($uploadPath, $barangayCertName, 'public');
            $data['barangayCertificate'] = $barangayCertPath;
        }

        // Delete old rejected applications for the same applicant (Option B: New Application)
        // This ensures that if applicant chooses to create a new application instead of re-uploading,
        // the old rejected application is removed to prevent duplicate detection issues
        try {
            $email = $request->email;
            $contactNumber = $request->contactNumber ?? $request->phoneNumber ?? null;
            
            // Build query to find rejected applications matching email OR contact number
            $oldRejectedApplications = \App\Models\Application::where('status', 'Rejected')
                ->where(function($query) use ($email, $contactNumber) {
                    if ($email) {
                        $query->where('email', $email);
                    }
                    if ($contactNumber) {
                        if ($email) {
                            $query->orWhere('contactNumber', $contactNumber);
                        } else {
                            $query->where('contactNumber', $contactNumber);
                        }
                    }
                });
            
            $rejectedApps = $oldRejectedApplications->get();
            
            if ($rejectedApps->count() > 0) {
                \Illuminate\Support\Facades\Log::info('Deleting old rejected applications before creating new one', [
                    'email' => $email,
                    'contact_number' => $contactNumber,
                    'rejected_applications_count' => $rejectedApps->count(),
                    'rejected_application_ids' => $rejectedApps->pluck('applicationID')->toArray()
                ]);
                
                // Delete associated files from storage before deleting applications
                $deletedCount = 0;
                foreach ($rejectedApps as $rejectedApp) {
                    $documentFields = [
                        'medicalCertificate', 'clinicalAbstract', 'voterCertificate',
                        'birthCertificate', 'wholeBodyPicture', 'affidavit',
                        'barangayCertificate', 'idPictures'
                    ];
                    
                    foreach ($documentFields as $field) {
                        if ($rejectedApp->$field) {
                            try {
                                \Illuminate\Support\Facades\Storage::disk('public')->delete($rejectedApp->$field);
                            } catch (\Exception $fileException) {
                                \Illuminate\Support\Facades\Log::warning('Failed to delete file for rejected application', [
                                    'application_id' => $rejectedApp->applicationID,
                                    'field' => $field,
                                    'file_path' => $rejectedApp->$field,
                                    'error' => $fileException->getMessage()
                                ]);
                            }
                        }
                    }
                    
                    // Delete the application model
                    try {
                        $rejectedApp->delete();
                        $deletedCount++;
                    } catch (\Exception $deleteException) {
                        \Illuminate\Support\Facades\Log::error('Failed to delete rejected application', [
                            'application_id' => $rejectedApp->applicationID,
                            'error' => $deleteException->getMessage()
                        ]);
                    }
                }
                
                \Illuminate\Support\Facades\Log::info('Old rejected applications deleted successfully', [
                    'deleted_count' => $deletedCount,
                    'email' => $email
                ]);
            }
        } catch (\Exception $deleteException) {
            // Log error but don't fail the new application creation
            \Illuminate\Support\Facades\Log::error('Failed to delete old rejected applications', [
                'error' => $deleteException->getMessage(),
                'trace' => $deleteException->getTraceAsString()
            ]);
        }

        \Illuminate\Support\Facades\Log::info('Creating application with data', [
            'data' => $data
        ]);

        $application = \App\Models\Application::create($data);

        \Illuminate\Support\Facades\Log::info('Application created successfully', [
            'application_id' => $application->applicationID,
            'application' => $application->toArray()
        ]);

        // Send submission confirmation email with reference number
        try {
            $emailService = new \App\Services\EmailService();
            $emailService->sendApplicationSubmissionEmail([
                'email' => $application->email,
                'firstName' => $application->firstName,
                'lastName' => $application->lastName,
                'referenceNumber' => $application->referenceNumber ?? 'N/A',
                'submissionDate' => $application->submissionDate ?? now()->toDateString()
            ]);
        } catch (\Exception $emailException) {
            \Illuminate\Support\Facades\Log::error('Failed to send submission email', [
                'application_id' => $application->applicationID,
                'error' => $emailException->getMessage()
            ]);
            // Don't fail the submission if email fails
        }

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application
        ], 201);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Application submission failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Failed to submit application',
            'message' => $e->getMessage()
        ], 500);
    }
});


// Document file serving route (public access for viewing)
Route::get('documents/file/{id}', [DocumentManagementController::class, 'getDocumentFile']);

// Support ticket file serving route (public access for viewing)
Route::get('support-tickets/messages/{messageId}/download', [SupportTicketController::class, 'downloadAttachment']);
Route::get('support-tickets/messages/{messageId}/image', [SupportTicketController::class, 'serveImage']);

// Application file serving route (for admin document preview)
Route::get('application-file/{applicationId}/{fileType}', function($applicationId, $fileType) {
    try {
        // Check for token-based authentication
        $user = Auth::user();
        if (!$user && request()->has('token')) {
            $token = request()->get('token');
            $user = \App\Models\User::where('remember_token', $token)->first();
            if ($user) {
                Auth::setUser($user);
            }
        }
        
        $application = \App\Models\Application::findOrFail($applicationId);
        
        // Check permissions if user is authenticated
        if ($user) {
            // Admin users can access any file
            if (!in_array($user->role, ['Admin', 'SuperAdmin'])) {
                // PWD members can only access their own application files
                if ($user->role === 'PWDMember' && $application->email !== $user->email) {
                    return response()->json([
                        'error' => 'Unauthorized access to application file'
                    ], 403);
                }
            }
        }
        
        // Map file types to database fields
        $fileFieldMap = [
            'medicalCertificate' => 'medicalCertificate',
            'barangayCertificate' => 'barangayCertificate',
            'clinicalAbstract' => 'clinicalAbstract',
            'voterCertificate' => 'voterCertificate',
            'birthCertificate' => 'birthCertificate',
            'wholeBodyPicture' => 'wholeBodyPicture',
            'affidavit' => 'affidavit',
            'idPictures' => 'idPictures' // Support idPictures (array)
        ];
        
        if (!isset($fileFieldMap[$fileType])) {
            return response()->json([
                'error' => 'Invalid file type',
                'valid_types' => array_keys($fileFieldMap)
            ], 400);
        }
        
        $fileField = $fileFieldMap[$fileType];
        $filePath = $application->$fileField;
        
        if (!$filePath) {
            return response()->json([
                'error' => 'File not found for this application',
                'application_id' => $applicationId,
                'file_type' => $fileType
            ], 404);
        }
        
        // Handle idPictures - now stored as single file (standardized), but support old array format for backward compatibility
        if ($fileType === 'idPictures') {
            // Check if it's stored as array (old format) or string (new format)
            if (is_array($filePath) && count($filePath) > 0) {
                // Old format: already an array - get first file (or index if provided)
                $index = request()->get('index', 0);
                $index = (int)$index;
                if ($index < 0 || $index >= count($filePath)) {
                    $index = 0;
                }
                $filePath = $filePath[$index];
            } elseif (is_string($filePath)) {
                // Check if it's a JSON string (old format) or regular path (new format)
                // JSON arrays start with '[' and JSON strings start with '"'
                if ((strpos(trim($filePath), '[') === 0) || (strpos(trim($filePath), '"') === 0 && strpos(trim($filePath), '[') !== false)) {
                    // Try to decode if it's a JSON string (old format)
                    $decoded = json_decode($filePath, true);
                    if (is_array($decoded) && count($decoded) > 0) {
                        // Old format: array - get first file (or index if provided)
                        $index = request()->get('index', 0);
                        $index = (int)$index;
                        if ($index < 0 || $index >= count($decoded)) {
                    $index = 0; // Default to first image if index is invalid
                }
                        $filePath = $decoded[$index];
                    }
                    // If decoding fails or returns null, treat as regular string path (new format)
                }
                // If it's a regular string path (new format), use it as-is
            }
        }
        
        // Try to retrieve file using FileStorageService (supports multiple storage methods)
        try {
            $storageMethod = \App\Services\FileStorageService::getStorageMethod();
            
            // Check if file exists in current storage
            if (!\App\Services\FileStorageService::fileExists($filePath, $storageMethod)) {
                // Fallback to local storage if not found
                if ($storageMethod !== 'local') {
                    $storageMethod = 'local';
                }
            }
            
            // Retrieve file content
            $fileData = \App\Services\FileStorageService::retrieveFile($filePath, $storageMethod);
            
            // Generate filename
            $extension = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'pdf';
            $fileName = $fileType . '_' . $application->firstName . '_' . $application->lastName . '.' . $extension;
            
            // Set appropriate headers
            $headers = [
                'Content-Type' => $fileData['mime_type'],
                'Content-Length' => $fileData['size'],
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
                'Cache-Control' => 'private, max-age=60, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ];

            // Return file response
            return response($fileData['content'], 200, $headers);
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error retrieving application file', [
                'application_id' => $applicationId,
                'file_type' => $fileType,
                'file_path' => $filePath,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'File not found or error retrieving file',
                'file_path' => $filePath,
                'application_id' => $applicationId,
                'file_type' => $fileType,
                'message' => $e->getMessage()
            ], 404);
        }
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Error serving application file: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Authorization letter file serving route
Route::get('authorization-letter/{claimId}', function($claimId) {
    try {
        // Check for token-based authentication
        $user = Auth::user();
        if (!$user && request()->has('token')) {
            $token = request()->get('token');
            $user = \App\Models\User::where('remember_token', $token)->first();
            if ($user) {
                Auth::setUser($user);
            }
        }
        
        $claim = \App\Models\BenefitClaim::findOrFail($claimId);
        
        // Check permissions if user is authenticated
        if ($user) {
            // Admin, SuperAdmin, and Staff2 can access any authorization letter
            if (!in_array($user->role, ['Admin', 'SuperAdmin', 'Staff2'])) {
                // PWD members can only access their own authorization letters
                if ($user->role === 'PWDMember' && $claim->pwdID !== $user->userID) {
                    return response()->json([
                        'error' => 'Unauthorized access to authorization letter'
                    ], 403);
                }
            }
        }
        
        if (!$claim->authorizationLetter) {
            return response()->json([
                'error' => 'Authorization letter not found for this claim'
            ], 404);
        }
        
        $filePath = $claim->authorizationLetter;
        $fullFilePath = storage_path('app/public/' . $filePath);
        
        if (!file_exists($fullFilePath)) {
            \Illuminate\Support\Facades\Log::error('Authorization letter file not found', [
                'claim_id' => $claimId,
                'file_path' => $filePath,
                'full_file_path' => $fullFilePath,
                'storage_path' => storage_path('app/public')
            ]);
            
            return response()->json([
                'error' => 'File not found on disk',
                'file_path' => $filePath,
                'full_file_path' => $fullFilePath
            ], 404);
        }
        
        // Get file info
        $fileSize = filesize($fullFilePath);
        $mimeType = mime_content_type($fullFilePath);
        
        // Generate filename
        $fileName = 'authorization_letter_' . $claimId . '.' . pathinfo($fullFilePath, PATHINFO_EXTENSION);
        
        // Set appropriate headers
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $fileSize,
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            'Cache-Control' => 'private, max-age=3600',
            'Pragma' => 'private'
        ];

        // Return file response with proper headers
        return response()->file($fullFilePath, $headers);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Error serving authorization letter: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // User management routes
    Route::apiResource('users', UserController::class);
    
    // PWD Member routes
    Route::apiResource('pwd-members', PWDMemberController::class);
    Route::get('pwd-members/{id}/applications', [PWDMemberController::class, 'getApplications']);
    Route::get('pwd-members/{id}/complaints', [PWDMemberController::class, 'getComplaints']);
    Route::get('pwd-members/{id}/benefit-claims', [PWDMemberController::class, 'getBenefitClaims']);
    Route::post('pwd-members/{id}/claim-card', [PWDMemberController::class, 'claimCard']);
    Route::post('pwd-members/{id}/renew-card', [PWDMemberController::class, 'renewCard']);
    Route::post('pwd-members/{id}/notify-card-ready', [PWDMemberController::class, 'notifyCardReady']);
    Route::post('pwd-members/{id}/notify-renewal-required', [PWDMemberController::class, 'notifyRenewalRequired']);
    Route::post('pwd-members/{id}/regenerate-qr', function (Request $request, $id) {
        try {
            // Try to find by database ID first
            $member = \App\Models\PWDMember::find($id);
            
            // If not found, try by userID
            if (!$member) {
                $member = \App\Models\PWDMember::where('userID', $id)->first();
            }
            
            if (!$member) {
                return response()->json(['success' => false, 'message' => 'PWD Member not found'], 404);
            }
            
            // Force regenerate QR code
            try {
                $qrData = \App\Services\QRCodeGenerator::generateAndStore($member, true);
                $member->refresh(); // Refresh to get the newly generated QR code data
                
                \Illuminate\Support\Facades\Log::info('QR code regenerated successfully', [
                    'member_id' => $member->id,
                    'userID' => $member->userID,
                    'pwd_id' => $member->pwd_id
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'QR code regenerated successfully',
                    'data' => [
                        'id' => $member->id,
                        'userID' => $member->userID,
                        'qr_code_data' => $member->qr_code_data,
                        'qr_code_generated_at' => $member->qr_code_generated_at
                    ]
                ]);
            } catch (\Exception $qrError) {
                \Illuminate\Support\Facades\Log::error('QR code regeneration failed', [
                    'error' => $qrError->getMessage(),
                    'trace' => $qrError->getTraceAsString(),
                    'member_id' => $member->id,
                    'userID' => $member->userID
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to regenerate QR code: ' . $qrError->getMessage(),
                    'error' => $qrError->getMessage()
                ], 500);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in regenerate QR endpoint', [
                'error' => $e->getMessage(),
                'member_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // PWD Member change password route
    Route::put('/pwd-member/change-password', function (Request $request) {
        try {
            $user = $request->user();
            if (!$user || $user->role !== 'PWDMember') {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'currentPassword' => 'required',
                'newPassword' => 'required|min:6',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['error' => 'Validation failed', 'messages' => $validator->errors()], 422);
            }
            
            // Verify current password
            if (!\Illuminate\Support\Facades\Hash::check($request->currentPassword, $user->password)) {
                return response()->json(['error' => 'Current password is incorrect'], 400);
            }
            
            // Update password
            $user->update([
                'password' => \Illuminate\Support\Facades\Hash::make($request->newPassword)
            ]);
            
            return response()->json(['message' => 'Password changed successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
    
    // Application routes are handled in RouteServiceProvider
    
    // Complaint routes
    Route::apiResource('complaints', ComplaintController::class);
    Route::patch('complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
    
    // Benefit routes
    Route::apiResource('benefits', BenefitController::class);
    Route::post('benefits/{id}/announce', [BenefitController::class, 'announceBenefit']); // Barangay President announcement
    Route::post('announcements/{id}/post', [BenefitController::class, 'postAnnouncement']); // Post draft announcement
    Route::post('announcements/{id}/announce-to-members', [BenefitController::class, 'announceToMembers']); // Barangay President: Announce to all members
    
    // Benefit Claim routes
    Route::apiResource('benefit-claims', BenefitClaimController::class);
    Route::patch('benefit-claims/{id}/status', [BenefitClaimController::class, 'updateStatus']);
    Route::get('benefit-claims/{id}/treasury-letter', [BenefitClaimController::class, 'downloadTreasuryLetter']);
    Route::post('benefit-claims/{id}/upload-signed-letter', [BenefitClaimController::class, 'uploadSignedLetter']);
    Route::get('benefit-claims/{id}/signed-letter', [BenefitClaimController::class, 'viewSignedLetter']);
    
    // Announcement routes (protected - for admin operations)
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::patch('/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
    Route::get('announcements/audience/{audience}', [AnnouncementController::class, 'getByAudience']);
    
    // Report routes
    Route::apiResource('reports', ReportController::class);
    Route::post('reports/generate/{type}', [ReportController::class, 'generateReport']);
    
    // Additional report endpoints
    Route::get('reports/barangay-stats/{barangay}', [ReportController::class, 'getBarangayStats']);
    Route::get('reports/pwd-masterlist/{barangay}', [ReportController::class, 'getPWDMasterlist']);
    Route::get('reports/application-status/{barangay}', [ReportController::class, 'getApplicationStatusReport']);
    Route::get('reports/disability-distribution/{barangay}', [ReportController::class, 'getDisabilityDistribution']);
    Route::get('reports/age-group-analysis/{barangay}', [ReportController::class, 'getAgeGroupAnalysis']);
    Route::get('reports/benefit-distribution/{barangay}', [ReportController::class, 'getBenefitDistribution']);
    Route::get('reports/monthly-activity/{barangay}', [ReportController::class, 'getMonthlyActivitySummary']);
    Route::get('reports/city-wide-stats', [ReportController::class, 'getCityWideStats']);
    Route::get('reports/barangay-performance', [ReportController::class, 'getBarangayPerformance']);
    Route::get('reports/all-barangays', [ReportController::class, 'getAllBarangays']);
    Route::get('reports/{id}/download', [ReportController::class, 'downloadReport']);
    
    // Audit Log routes (SuperAdmin only)
    Route::middleware('superadmin')->group(function () {
        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('audit-logs/user/{userId}', [AuditLogController::class, 'getByUser']);
        Route::get('audit-logs/action/{action}', [AuditLogController::class, 'getByAction']);
        
        // Security Monitoring routes (SuperAdmin only)
        Route::prefix('security-monitoring')->group(function () {
            Route::get('/', [SecurityMonitoringController::class, 'index']);
            Route::get('/statistics', [SecurityMonitoringController::class, 'getStatistics']);
            Route::get('/{eventId}', [SecurityMonitoringController::class, 'show']);
            Route::put('/{eventId}/status', [SecurityMonitoringController::class, 'updateStatus']);
            Route::post('/bulk-update-status', [SecurityMonitoringController::class, 'bulkUpdateStatus']);
            Route::delete('/delete-events', [SecurityMonitoringController::class, 'deleteEvents']);
        });
    });
    
    // Support Ticket routes
    Route::get('support-tickets/archived', [SupportTicketController::class, 'archived']);
    Route::apiResource('support-tickets', SupportTicketController::class);
    Route::post('support-tickets/{id}/messages', [SupportTicketController::class, 'addMessage']);
    Route::get('support-tickets/messages/{messageId}/force-download', [SupportTicketController::class, 'forceDownloadAttachment']);
    
    // Pending Registration Policy Settings (Admin only)
    Route::get('pending-registration-policy', function (Request $request) {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Admin', 'SuperAdmin'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        return (new \App\Http\Controllers\API\PendingRegistrationPolicyController)->index();
    });
    Route::get('pending-registration-policy/{key}', function (Request $request, $key) {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Admin', 'SuperAdmin'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        return (new \App\Http\Controllers\API\PendingRegistrationPolicyController)->show($key);
    });
    Route::put('pending-registration-policy', function (Request $request) {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Admin', 'SuperAdmin'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        return (new \App\Http\Controllers\API\PendingRegistrationPolicyController)->update($request);
    });
    
    // Dashboard data routes
    Route::get('dashboard/test', [DashboardController::class, 'test']);
    Route::get('dashboard/recent-activities', [DashboardController::class, 'getRecentActivities']);
    Route::get('dashboard/barangay-contacts', [DashboardController::class, 'getBarangayContacts']);
    
    // Gmail API routes for admin email (sarinonhoelivan29@gmail.com)
    Route::get('gmail/auth-url', [GmailController::class, 'getAuthUrl']);
    Route::post('gmail/callback', [GmailController::class, 'handleCallback']);
    Route::get('gmail/test', [GmailController::class, 'testConnection']);
    Route::get('gmail/status', [GmailController::class, 'getStatus']);
    
    // Analytics routes with automated suggestions
    Route::prefix('analytics')->group(function () {
        Route::get('suggestions', [AnalyticsController::class, 'getAutomatedSuggestions']);
        Route::get('suggestions/category/{category}', [AnalyticsController::class, 'getCategorySuggestions']);
        Route::get('suggestions/summary', [AnalyticsController::class, 'getSuggestionSummary']);
        Route::get('suggestions/high-priority', [AnalyticsController::class, 'getHighPrioritySuggestions']);
        Route::get('transaction-analysis', [AnalyticsController::class, 'getTransactionAnalysis']);
        Route::get('comprehensive', [AnalyticsController::class, 'getComprehensiveAnalytics']);
    });

    // Document Management routes
    Route::prefix('documents')->group(function () {
        // Admin routes
        Route::get('/', [DocumentManagementController::class, 'index']);
        Route::post('/', [DocumentManagementController::class, 'store']);
        Route::put('/{id}', [DocumentManagementController::class, 'update']);
        Route::delete('/{id}', [DocumentManagementController::class, 'destroy']);
        Route::get('/pending-reviews', [DocumentManagementController::class, 'getPendingReviews']);
        Route::get('/all-members', [DocumentManagementController::class, 'getAllMemberDocuments']);
        Route::post('/{id}/review', [DocumentManagementController::class, 'reviewDocument']);
        
        // Member routes
        Route::get('/my-documents', [DocumentManagementController::class, 'getMemberDocuments']);
        Route::post('/upload', [DocumentManagementController::class, 'uploadDocument']);
        
        // Notification routes
        Route::get('/notifications', [DocumentManagementController::class, 'getNotifications']);
        Route::post('/notifications/{id}/read', [DocumentManagementController::class, 'markNotificationAsRead']);
    });

    // ID Renewal routes
    Route::prefix('id-renewals')->group(function () {
        // Member routes
        Route::post('/submit', [IDRenewalController::class, 'submitRenewal']);
        Route::get('/my-status', [IDRenewalController::class, 'getMyRenewalStatus']);
        
        // Admin routes
        Route::get('/', [IDRenewalController::class, 'getAllRenewals']);
        Route::get('/{id}', [IDRenewalController::class, 'getRenewal']);
        Route::post('/{id}/approve', [IDRenewalController::class, 'approveRenewal']);
        Route::post('/{id}/reject', [IDRenewalController::class, 'rejectRenewal']);
        Route::post('/{id}/send-remarks', [IDRenewalController::class, 'sendRemarks']);
        Route::get('/{id}/file/{type}', [IDRenewalController::class, 'getFile']);
    });

    // Storage serving route for renewal files (with authentication)
    Route::get('storage/id-renewals/{path}', function($path) {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Only allow admins or members to access their own files
            $isAdmin = in_array($user->role, ['Admin', 'SuperAdmin']);
            
            // Get the renewal by checking file path
            $renewal = \App\Models\IDRenewal::where('old_card_image_path', 'id-renewals/' . $path)
                ->orWhere('medical_certificate_path', 'id-renewals/' . $path)
                ->first();

            if ($renewal) {
                $isOwner = $renewal->member_id == $user->userID;
                if (!$isAdmin && !$isOwner) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }
            } elseif (!$isAdmin) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $filePath = 'id-renewals/' . $path;
            
            if (!Storage::disk('public')->exists($filePath)) {
                return response()->json(['error' => 'File not found'], 404);
            }

            $fullPath = Storage::disk('public')->path($filePath);
            
            if (!file_exists($fullPath)) {
                return response()->json(['error' => 'File not found on filesystem'], 404);
            }

            $fileSize = filesize($fullPath);
            $mimeType = mime_content_type($fullPath) ?: 'application/octet-stream';
            
            return response()->file($fullPath, [
                'Content-Type' => $mimeType,
                'Content-Length' => $fileSize,
                'Content-Disposition' => 'inline; filename="' . basename($filePath) . '"',
                'Cache-Control' => 'private, max-age=3600'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error serving renewal file from storage', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to serve file'], 500);
        }
    })->where('path', '.*');

    // Renewal Management routes (for flagged members)
    Route::prefix('renewals')->group(function () {
        Route::get('/members', [RenewalController::class, 'getRenewalMembers']);
        Route::get('/stats', [RenewalController::class, 'getRenewalStats']);
        Route::get('/settings', [RenewalController::class, 'getRenewalSettings']);
        Route::post('/settings', [RenewalController::class, 'updateRenewalSettings']);
    });

    // Enhanced ID Claim routes (for new card claims and renewals with full tracking)
    Route::prefix('id-claims')->group(function () {
        // List and filter claims
        Route::get('/', [IDClaimController::class, 'index']);
        Route::get('/today-scheduled', [IDClaimController::class, 'getTodayScheduled']);
        Route::get('/member/{memberId}', [IDClaimController::class, 'getByMember']);
        Route::get('/{id}', [IDClaimController::class, 'show']);
        
        // Claim process steps
        Route::post('/initiate', [IDClaimController::class, 'initiateClaim']);
        Route::patch('/{id}/status', [IDClaimController::class, 'updateStatus']);
        Route::post('/{id}/schedule', [IDClaimController::class, 'schedulePickup']);
        Route::post('/{id}/complete', [IDClaimController::class, 'completeClaim']);
        Route::post('/{id}/cancel', [IDClaimController::class, 'cancel']);
        
        // Receipt
        Route::get('/{id}/receipt', [IDClaimController::class, 'downloadReceipt']);
    });

    // Disability Assessment routes
    Route::prefix('disability-assessments')->group(function () {
        // Admin/Staff routes
        Route::get('/', [DisabilityAssessmentController::class, 'index']);
        Route::get('/statistics', [DisabilityAssessmentController::class, 'getStatistics']);
        Route::get('/today', [DisabilityAssessmentController::class, 'getTodayScheduled']);
        Route::get('/upcoming', [DisabilityAssessmentController::class, 'getUpcoming']);
        Route::get('/available-dates', [DisabilityAssessmentController::class, 'getAvailableDates']);
        Route::get('/available-slots/{date}', [DisabilityAssessmentController::class, 'getAvailableSlots']);
        Route::get('/{id}', [DisabilityAssessmentController::class, 'show']);
        Route::post('/schedule', [DisabilityAssessmentController::class, 'scheduleAssessment']);
        Route::put('/{id}', [DisabilityAssessmentController::class, 'updateAssessment']);
        Route::post('/{id}/finalize', [DisabilityAssessmentController::class, 'finalizeAssessment']);
        Route::get('/{id}/download-pdf', [DisabilityAssessmentController::class, 'downloadPDF']);
        
        // Missed appointment and rescheduling routes
        Route::post('/{id}/mark-missed', [DisabilityAssessmentController::class, 'markAsMissed']);
        Route::post('/{id}/mark-present', [DisabilityAssessmentController::class, 'markAsPresent']);
        Route::post('/{id}/reschedule', [DisabilityAssessmentController::class, 'rescheduleByAdmin']);
        Route::post('/{id}/upload-pdf', [DisabilityAssessmentController::class, 'uploadPDF']);
        
        // Scheduler endpoint (for cron jobs)
        Route::post('/check-missed', [DisabilityAssessmentController::class, 'checkMissedAppointments']);
    });

    // Document Migration routes (Admin only)
    Route::prefix('admin')->group(function () {
        Route::post('/migrate-documents', [App\Http\Controllers\API\DocumentMigrationController::class, 'migrateApplicationDocuments']);
        Route::get('/migration-status', [App\Http\Controllers\API\DocumentMigrationController::class, 'getMigrationStatus']);
        Route::post('/migrate-all-documents', function (Request $request) {
            if ($request->user()->role !== 'Admin' && $request->user()->role !== 'SuperAdmin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            $documentMigrationService = new \App\Services\DocumentMigrationService();
            $result = $documentMigrationService->migrateAllApprovedApplications();
            
            return response()->json($result);
        });
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', function (Request $request) {
            try {
                $user = $request->user();
                
                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'error' => 'User not authenticated'
                    ], 401);
                }
                
                // Log for debugging
                \Illuminate\Support\Facades\Log::info('Fetching notifications', [
                    'user_id' => $user->userID,
                    'user_role' => $user->role,
                    'username' => $user->username
                ]);
                
                // Ensure proper sorting: latest first (descending by created_at, then by id as tiebreaker)
                // This ensures the newest notifications appear at the top
                $notifications = \App\Models\Notification::forUser($user->userID)
                    ->orderBy('created_at', 'desc')
                    ->orderBy('id', 'desc') // Secondary sort for consistent ordering when created_at is the same
                    ->get();
                
                \Illuminate\Support\Facades\Log::info('Notifications fetched', [
                    'user_id' => $user->userID,
                    'user_userID' => $user->userID,
                    'count' => $notifications->count(),
                    'notification_user_ids' => $notifications->pluck('user_id')->toArray(),
                    'sample_notification' => $notifications->first() ? [
                        'id' => $notifications->first()->id,
                        'user_id' => $notifications->first()->user_id,
                        'type' => $notifications->first()->type,
                        'title' => $notifications->first()->title
                    ] : null
                ]);
                
                $formattedNotifications = $notifications->map(function ($notification) {
                    // Ensure timestamps are properly formatted
                    return [
                        'id' => $notification->id,
                        'user_id' => $notification->user_id,
                        'type' => $notification->type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'data' => $notification->data,
                        'is_read' => $notification->is_read,
                        'read_at' => $notification->read_at ? $notification->read_at->toIso8601String() : null,
                        'created_at' => $notification->created_at->toIso8601String(), // UTC ISO format for consistency
                        'updated_at' => $notification->updated_at->toIso8601String(), // UTC ISO format for consistency
                        'timestamp' => $notification->created_at->toIso8601String(), // Alias for frontend compatibility (UTC)
                        'ph_time' => $notification->created_at->setTimezone('Asia/Manila')->format('Y-m-d H:i:s'), // Philippine Time for display
                        'ph_time_formatted' => $notification->created_at->setTimezone('Asia/Manila')->format('M d, Y h:i A') // Formatted Philippine Time
                    ];
                });
                
                return response()->json([
                    'success' => true,
                    'notifications' => $formattedNotifications,
                    'debug' => [
                        'user_id' => $user->userID,
                        'user_role' => $user->role,
                        'total_count' => $formattedNotifications->count()
                    ]
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to fetch notifications', [
                    'user_id' => $request->user()->userID ?? null,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to fetch notifications',
                    'message' => $e->getMessage()
                ], 500);
            }
        });
        
        Route::get('/unread', function (Request $request) {
            try {
                $user = $request->user();
                $unreadCount = \App\Models\Notification::forUser($user->userID)
                    ->unread()
                    ->count();
                
                return response()->json([
                    'success' => true,
                    'unread_count' => $unreadCount
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to fetch unread count', [
                    'user_id' => $request->user()->userID ?? null,
                    'error' => $e->getMessage()
                ]);
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to fetch unread count',
                    'message' => $e->getMessage()
                ], 500);
            }
        });

        Route::post('/{id}/mark-read', function (Request $request, $id) {
            try {
                $user = $request->user();
                $notification = \App\Models\Notification::forUser($user->userID)
                    ->findOrFail($id);
                
                $notification->markAsRead();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Notification marked as read'
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to mark notification as read',
                    'message' => $e->getMessage()
                ], 500);
            }
        });

        Route::post('/mark-all-read', function (Request $request) {
            try {
                $user = $request->user();
                \App\Models\Notification::forUser($user->userID)
                    ->unread()
                    ->update([
                        'is_read' => true,
                        'read_at' => now()
                    ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'All notifications marked as read'
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to mark all notifications as read',
                    'message' => $e->getMessage()
                ], 500);
            }
        });
    });
});

// Admin approval route for applications (protected)
Route::middleware('auth:sanctum')->post('/applications/{applicationId}/approve-admin', function (Request $request, $applicationId) {
    try {
        $application = \App\Models\Application::findOrFail($applicationId);
        
        // Generate secure random password
        $randomPassword = \Illuminate\Support\Str::random(12);
        
        // Check if user already exists
        $existingUser = \App\Models\User::where('email', $application->email)->first();
        
        if ($existingUser) {
            // User already exists, update their role to PWDMember and password
            $existingUser->update([
                'role' => 'PWDMember',
                'status' => 'active',
                'password' => \Illuminate\Support\Facades\Hash::make($randomPassword)
            ]);
            $pwdUser = $existingUser;
        } else {
            // Create new PWD Member User Account
            $pwdUser = \App\Models\User::create([
                'username' => $application->email, // Use email as username
                'email' => $application->email,
                'password' => \Illuminate\Support\Facades\Hash::make($randomPassword),
                'role' => 'PWDMember',
                'status' => 'active'
            ]);
        }

        // Generate unique PWD ID
        $pwdId = 'PWD-' . str_pad($pwdUser->userID, 6, '0', STR_PAD_LEFT);

        // Update application status
        $application->update([
            'status' => 'Approved',
            'remarks' => 'Test approval - Account created',
            'pwdID' => $pwdUser->userID
        ]);

        // Migrate documents from application to member_documents table
        $documentMigrationService = new \App\Services\DocumentMigrationService();
        $migrationResult = $documentMigrationService->migrateApplicationDocuments($application, $pwdUser);

        // Send email notification
        try {
            $emailService = new \App\Services\EmailService();
            $emailSent = $emailService->sendApplicationApprovalEmail([
                'firstName' => $application->firstName,
                'lastName' => $application->lastName,
                'email' => $application->email,
                'username' => $pwdUser->username,
                'password' => $randomPassword,
                'pwdId' => $pwdId,
                'loginUrl' => config('app.frontend_url', 'http://localhost:3000/login')
            ]);

            // Send welcome notification with card processing info (5-7 business days)
            $applicantName = trim($application->firstName . ' ' . $application->lastName);
            \App\Services\NotificationService::notifyNewMemberWelcome(
                $pwdUser->userID,
                $applicantName,
                $pwdId,
                $application->barangay
            );

            return response()->json([
                'message' => '✅ ADMIN APPROVAL SUCCESSFUL!',
                'details' => [
                    'application_approved' => true,
                    'user_account_created' => true,
                    'documents_migrated' => $migrationResult['success'] ?? false,
                    'documents_migrated_count' => $migrationResult['migrated_count'] ?? 0,
                    'email_sent' => $emailSent
                ],
                'application' => [
                    'id' => $application->applicationID,
                    'name' => $application->firstName . ' ' . $application->lastName,
                    'email' => $application->email,
                    'status' => $application->status
                ],
                'user_account' => [
                    'userID' => $pwdUser->userID,
                    'email' => $pwdUser->email,
                    'role' => $pwdUser->role,
                    'status' => $pwdUser->status,
                    'pwdId' => $pwdId
                ],
                'login_credentials' => [
                    'email' => $application->email,
                    'password' => $randomPassword,
                    'note' => 'Password is hashed in database for security'
                ],
                'email_status' => $emailSent ? 'Email sent successfully' : 'Email failed to send'
            ]);

        } catch (\Exception $mailError) {
            return response()->json([
                'message' => '✅ ADMIN APPROVAL SUCCESSFUL! (Email failed)',
                'details' => [
                    'application_approved' => true,
                    'user_account_created' => true,
                    'email_sent' => false,
                    'email_error' => $mailError->getMessage()
                ],
                'application' => $application,
                'user_account' => $pwdUser,
                'login_credentials' => [
                    'email' => $application->email,
                    'password' => $randomPassword
                ]
            ]);
        }

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to approve application',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Admin approval route for applications (protected)
Route::middleware('auth:sanctum')->post('/applications/{applicationId}/approve-admin', function (Request $request, $applicationId) {
    try {
        // Check if user is admin
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Admin', 'SuperAdmin', 'Staff1'])) {
            return response()->json([
                'error' => 'Unauthorized. Admin privileges required.'
            ], 403);
        }

        // Find the application
        $application = \App\Models\Application::where('applicationID', $applicationId)->first();
        
        if (!$application) {
            return response()->json([
                'error' => 'Application not found'
            ], 404);
        }

        // Check if application is already approved
        if ($application->status === 'Approved') {
            // Check if user and PWD member already exist
            $existingUser = \App\Models\User::where('email', $application->email)->first();
            if ($existingUser) {
                $existingMember = \App\Models\PWDMember::where('userID', $existingUser->userID)->first();
                if ($existingMember) {
                    return response()->json([
                        'message' => 'Application is already approved',
                        'application' => [
                            'id' => $application->applicationID,
                            'name' => $application->firstName . ' ' . $application->lastName,
                            'email' => $application->email,
                            'status' => $application->status,
                            'pwdId' => $existingMember->pwd_id
                        ],
                        'user_account' => [
                            'email' => $existingUser->email,
                            'userID' => $existingUser->userID
                        ]
                    ], 200);
                }
            }
        }

        // Check if application is in valid status for admin approval
        $validStatuses = ['Pending Admin Approval', 'For Assessment'];
        if (!in_array($application->status, $validStatuses)) {
            return response()->json([
                'error' => 'Application is not ready for admin approval',
                'current_status' => $application->status
            ], 400);
        }

        // Check if disability assessment is completed (REQUIRED for approval)
        // Try both application_id and applicationID fields to find the assessment
        $assessment = \App\Models\DisabilityAssessment::where('application_id', $applicationId)
            ->orWhere('application_id', $application->id)
            ->first();
            
        if (!$assessment) {
            return response()->json([
                'error' => 'Cannot approve application',
                'message' => 'Disability assessment has not been created for this application.'
            ], 400);
        }

        // Check if assessment is finalized with PDF (allow completed status if PDF exists)
        if (!in_array($assessment->status, ['finalized', 'uploaded', 'completed'])) {
            return response()->json([
                'error' => 'Cannot approve application',
                'message' => 'Disability assessment must be completed and finalized before approval. Current assessment status: ' . $assessment->status
            ], 400);
        }

        // Check if assessment PDF exists (required for approval)
        if (!$assessment->pdf_path) {
            return response()->json([
                'error' => 'Cannot approve application',
                'message' => 'The disability assessment PDF must be generated or uploaded before final approval. Please finalize or upload the assessment PDF first.'
            ], 400);
        }
        
        // Log approval attempt for debugging
        \Illuminate\Support\Facades\Log::info('Admin approval attempt', [
            'application_id' => $applicationId,
            'application_status' => $application->status,
            'assessment_id' => $assessment->id,
            'assessment_status' => $assessment->status,
            'has_pdf' => !empty($assessment->pdf_path)
        ]);

        // Check attendance status - applicant must have shown up or validly rescheduled
        if ($assessment->attendance_status === 'absent' || $assessment->is_missed) {
            // Check if they have rescheduled
            if ($assessment->reschedule_count === 0) {
                return response()->json([
                    'error' => 'Cannot approve application',
                    'message' => 'The applicant missed their scheduled assessment appointment and has not rescheduled. Please contact the applicant or reschedule the assessment.'
                ], 400);
            }
        }

        // Check if there's a pending document correction request
        $pendingCorrection = \App\Models\DocumentCorrectionRequest::where('application_id_string', $applicationId)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();
        
        if ($pendingCorrection) {
            return response()->json([
                'error' => 'Cannot approve application',
                'message' => 'A document correction request is pending. Please wait for the applicant to submit corrected documents before approving.'
            ], 400);
        }

        // Generate secure random password
        $randomPassword = \Illuminate\Support\Str::random(12);
        
        // Check if user already exists
        $existingUser = \App\Models\User::where('email', $application->email)->first();
        $isNewUser = !$existingUser;
        
        if ($existingUser) {
            // User already exists, use existing user
            $newUser = $existingUser;
            // Update user if needed
            if ($newUser->role !== 'PWDMember') {
                $newUser->role = 'PWDMember';
                $newUser->status = 'Active';
                $newUser->save();
            }
        } else {
            // Get the next available user ID first
            $nextUserId = \App\Models\User::max('userID') + 1;
            
            // Create User account
            $newUser = new \App\Models\User();
            $newUser->userID = $nextUserId;
            $newUser->username = $application->email; // Use email as username
            $newUser->email = $application->email;
            $newUser->password = \Illuminate\Support\Facades\Hash::make($randomPassword);
            $newUser->role = 'PWDMember';
            $newUser->status = 'Active';
            $newUser->password_change_required = true; // Require password change on first login
            $newUser->save();
        }

        // Generate PWD ID
        $pwdId = 'PWD-' . strtoupper(substr($application->firstName, 0, 2)) . 
                strtoupper(substr($application->lastName, 0, 2)) . 
                str_pad($application->applicationID, 4, '0', STR_PAD_LEFT);

        // Check if PWD ID already exists
        $existingPwdMember = \App\Models\PWDMember::where('pwd_id', $pwdId)->first();
        if ($existingPwdMember && $existingPwdMember->userID !== $newUser->userID) {
            // PWD ID exists for a different user, generate a unique one
            $counter = 1;
            $basePwdId = $pwdId;
            do {
                $pwdId = $basePwdId . '-' . str_pad($counter, 2, '0', STR_PAD_LEFT);
                $existingPwdMember = \App\Models\PWDMember::where('pwd_id', $pwdId)->first();
                $counter++;
            } while ($existingPwdMember && $counter < 100); // Safety limit
            
            \Illuminate\Support\Facades\Log::warning('PWD ID collision detected, using alternative ID', [
                'original_pwd_id' => $basePwdId,
                'new_pwd_id' => $pwdId,
                'application_id' => $application->applicationID
            ]);
        }

        // Check if PWD member already exists for this user
        $pwdMember = \App\Models\PWDMember::where('userID', $newUser->userID)->first();
        $isNewMember = !$pwdMember;
        
        if ($pwdMember) {
            // PWD member already exists, update it
            $pwdMember->firstName = $application->firstName;
            $pwdMember->lastName = $application->lastName;
            $pwdMember->middleName = $application->middleName;
            $pwdMember->birthDate = $application->birthDate;
            $pwdMember->disabilityType = $application->disabilityType;
            $pwdMember->address = $application->address;
            $pwdMember->barangay = $application->barangay;
            $pwdMember->emergencyContact = $application->emergencyContact;
            $pwdMember->emergencyPhone = $application->emergencyPhone;
            $pwdMember->emergencyRelationship = $application->emergencyRelationship;
            // Only update pwd_id if it's different and doesn't exist for another user
            if ($pwdMember->pwd_id !== $pwdId) {
                $checkExisting = \App\Models\PWDMember::where('pwd_id', $pwdId)
                    ->where('userID', '!=', $newUser->userID)
                    ->first();
                if (!$checkExisting) {
                    $pwdMember->pwd_id = $pwdId;
                }
            }
            $pwdMember->status = 'Active';
            if (!$pwdMember->approval_date) {
                $pwdMember->approval_date = now()->toDateString();
            }
            $pwdMember->save();
        } else {
            // Create new PWD Member record
            $pwdMember = new \App\Models\PWDMember();
            $pwdMember->userID = $newUser->userID;
            $pwdMember->firstName = $application->firstName;
            $pwdMember->lastName = $application->lastName;
            $pwdMember->middleName = $application->middleName;
            $pwdMember->birthDate = $application->birthDate;
            $pwdMember->disabilityType = $application->disabilityType;
            $pwdMember->address = $application->address;
            $pwdMember->barangay = $application->barangay;
            $pwdMember->emergencyContact = $application->emergencyContact;
            $pwdMember->emergencyPhone = $application->emergencyPhone;
            $pwdMember->emergencyRelationship = $application->emergencyRelationship;
            $pwdMember->pwd_id = $pwdId;
            $pwdMember->status = 'Active';
            $pwdMember->approval_date = now()->toDateString(); // Set approval date
            $pwdMember->save();
        }
        
        // Generate and store QR code for the PWD member (only if new member or QR code doesn't exist)
        if ($isNewMember || empty($pwdMember->qr_code_data)) {
            try {
                \App\Services\QRCodeGenerator::generateAndStore($pwdMember);
            } catch (\Exception $qrError) {
                \Illuminate\Support\Facades\Log::error('QR code generation failed during approval', [
                    'error' => $qrError->getMessage(),
                    'pwd_member_id' => $pwdMember->userID
                ]);
            }
        }

        // Update application status and link to user
        $application->status = 'Approved';
        $application->pwdID = $newUser->userID; // Link application to the user
        $application->save();

        // Migrate documents from application to member_documents table
        // CRITICAL: This must succeed - documents are required for member accounts
        $documentMigrationService = new \App\Services\DocumentMigrationService();
        $migrationResult = $documentMigrationService->migrateApplicationDocuments($application, $newUser, $user->userID);
        
        \Illuminate\Support\Facades\Log::info('Document migration result', [
            'application_id' => $application->applicationID,
            'migration_result' => $migrationResult,
            'member_id' => $newUser->userID
        ]);
        
        // If migration failed or no documents were migrated, log warning but don't fail approval
        // (Some applications might not have all documents uploaded)
        if (!$migrationResult['success'] || $migrationResult['migrated_count'] === 0) {
            \Illuminate\Support\Facades\Log::warning('Document migration had issues during approval', [
                'application_id' => $application->applicationID,
                'member_id' => $newUser->userID,
                'migration_result' => $migrationResult,
                'application_documents' => [
                    'medicalCertificate' => !empty($application->medicalCertificate),
                    'idPictures' => !empty($application->idPictures),
                    'barangayCertificate' => !empty($application->barangayCertificate),
                    'clinicalAbstract' => !empty($application->clinicalAbstract),
                    'voterCertificate' => !empty($application->voterCertificate),
                    'birthCertificate' => !empty($application->birthCertificate),
                ]
            ]);
        }

        // Calculate claim date (14 business days from approval, excluding weekends and holidays)
        $approvalDate = \Carbon\Carbon::parse($pwdMember->approval_date);
        $claimDate = \App\Services\HolidayService::addBusinessDays($approvalDate, 14);
        $claimDateFormatted = $claimDate->format('F d, Y'); // e.g., "January 15, 2025"
        $claimDateShort = $claimDate->format('M d, Y'); // e.g., "Jan 15, 2025"

        // Send approval email (only if new user)
        $emailSent = false;
        if ($isNewUser) {
            try {
                \Illuminate\Support\Facades\Mail::send('emails.application-approved', [
                    'firstName' => $application->firstName,
                    'lastName' => $application->lastName,
                    'email' => $application->email,
                    'username' => $application->email,
                    'password' => $randomPassword,
                    'pwdId' => $pwdId,
                    'loginUrl' => config('app.frontend_url', 'http://localhost:3000/login'),
                    'claimDate' => $claimDateFormatted,
                    'claimDateShort' => $claimDateShort
                ], function ($message) use ($application) {
                    $message->to($application->email)
                            ->subject('PWD Application Approved - Your Account Details');
                });
                $emailSent = true;
            } catch (\Exception $mailError) {
                \Illuminate\Support\Facades\Log::error('Email sending failed', ['error' => $mailError->getMessage()]);
            }
        } else {
            // User already exists - log that email was skipped
            \Illuminate\Support\Facades\Log::info('Skipping approval email for existing user', [
                'email' => $application->email,
                'user_id' => $newUser->userID
            ]);
        }

        // Send in-app notification to the new user
        try {
            $applicantName = trim($application->firstName . ' ' . $application->lastName);
            
            // Send application status notification
            \App\Services\NotificationService::notifyApplicationStatusChange(
                $newUser->userID,
                'Approved',
                $applicantName,
                'Your application has been approved. You can now log in to access your PWD member portal.'
            );
            
            // Send detailed welcome notification with card processing info (5-7 business days)
            \App\Services\NotificationService::notifyNewMemberWelcome(
                $newUser->userID,
                $applicantName,
                $pwdId,
                $application->barangay
            );
            
            \Illuminate\Support\Facades\Log::info('Approval notifications sent', [
                'user_id' => $newUser->userID,
                'application_id' => $application->applicationID,
                'pwd_id' => $pwdId
            ]);
        } catch (\Exception $notifError) {
            \Illuminate\Support\Facades\Log::error('Notification sending failed', [
                'error' => $notifError->getMessage(),
                'user_id' => $newUser->userID ?? null
            ]);
        }

        return response()->json([
            'message' => $isNewUser ? 'Application approved successfully' : 'Application approved and existing account updated',
            'application' => [
                'id' => $application->applicationID,
                'name' => $application->firstName . ' ' . $application->lastName,
                'email' => $application->email,
                'status' => $application->status,
                'pwdId' => $pwdId
            ],
            'user_account' => [
                'email' => $application->email,
                'userID' => $newUser->userID,
                'password' => $isNewUser ? $randomPassword : 'Password unchanged (existing account)',
                'is_new' => $isNewUser
            ],
            'pwd_member' => [
                'pwd_id' => $pwdId,
                'is_new' => $isNewMember
            ],
            'email_sent' => $emailSent
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to approve application',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Fallback route for undefined API endpoints
Route::fallback(function () {
    return response()->json([
        'message' => 'API endpoint not found. Please check your request.'
    ], 404);
});