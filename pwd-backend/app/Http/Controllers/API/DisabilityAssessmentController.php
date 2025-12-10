<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DisabilityAssessment;
use App\Models\Application;
use App\Models\User;
use App\Models\BarangayPresident;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class DisabilityAssessmentController extends Controller
{
    /**
     * Get all assessments (for admin/staff)
     */
    public function index(Request $request)
    {
        $query = DisabilityAssessment::with(['application', 'assessor', 'finalizer']);
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Filter by date (only if date is provided)
        if ($request->has('date') && $request->date) {
            $query->whereDate('assessment_date', $request->date);
        }
        
        // Filter by date range (only if both dates are provided)
        if ($request->has('from_date') && $request->has('to_date') && $request->from_date && $request->to_date) {
            $query->whereBetween('assessment_date', [$request->from_date, $request->to_date]);
        }
        
        // Order: pending first (no date), then by date desc, then by slot
        $assessments = $query->orderByRaw('CASE WHEN assessment_date IS NULL THEN 0 ELSE 1 END')
            ->orderByRaw('COALESCE(assessment_date, created_at) DESC')
            ->orderBy('slot_number')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 50);
        
        return response()->json($assessments);
    }

    /**
     * Get assessment by ID
     */
    public function show($id)
    {
        $assessment = DisabilityAssessment::with(['application', 'assessor', 'finalizer'])->find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        return response()->json($assessment);
    }

    /**
     * Get assessment by reference number (for applicant access)
     */
    public function getByReferenceNumber($referenceNumber)
    {
        $assessment = DisabilityAssessment::where('reference_number', $referenceNumber)
            ->with('application')
            ->first();
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        return response()->json($assessment);
    }

    /**
     * Get available dates with slots
     */
    public function getAvailableDates(Request $request)
    {
        $startDate = Carbon::parse($request->start_date ?? today());
        $endDate = Carbon::parse($request->end_date ?? today()->addDays(30));
        
        // If application_id is provided, limit dates to within the application's holding period
        $applicationExpiresAt = null;
        if ($request->has('application_id')) {
            $application = Application::find($request->application_id);
            if ($application && $application->expires_at) {
                $applicationExpiresAt = Carbon::parse($application->expires_at);
                // Limit end date to application expiry date if it's earlier
                if ($applicationExpiresAt->isBefore($endDate)) {
                    $endDate = $applicationExpiresAt;
                }
            }
        }
        
        $dates = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            // Skip weekends
            if (!$currentDate->isWeekend()) {
                $count = DisabilityAssessment::getAppointmentCount($currentDate);
                $dates[] = [
                    'date' => $currentDate->format('Y-m-d'),
                    'day' => $currentDate->format('l'),
                    'available_slots' => 10 - $count,
                    'is_available' => $count < 10
                ];
            }
            $currentDate->addDay();
        }
        
        return response()->json([
            'dates' => $dates,
            'application_expires_at' => $applicationExpiresAt ? $applicationExpiresAt->format('Y-m-d') : null
        ]);
    }

    /**
     * Get available slots for a specific date
     */
    public function getAvailableSlots($date)
    {
        $availableSlots = DisabilityAssessment::getAvailableSlots($date);
        $timeSlots = DisabilityAssessment::getTimeSlots();
        
        $slots = [];
        foreach ($timeSlots as $slotNumber => $timeLabel) {
            $slots[] = [
                'slot_number' => $slotNumber,
                'time_label' => $timeLabel,
                'is_available' => in_array($slotNumber, $availableSlots)
            ];
        }
        
        return response()->json([
            'date' => $date,
            'total_slots' => 10,
            'available_count' => count($availableSlots),
            'slots' => $slots
        ]);
    }

    /**
     * Schedule an assessment (called after barangay approval)
     */
    public function scheduleAssessment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'application_id' => 'required|exists:application,applicationID',
            'assessment_date' => 'required|date|after_or_equal:today',
            'slot_number' => 'required|integer|min:1|max:10'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if date is a weekend
        $assessmentDate = Carbon::parse($request->assessment_date);
        if ($assessmentDate->isWeekend()) {
            return response()->json([
                'message' => 'Assessments cannot be scheduled on weekends. Please select a weekday.'
            ], 400);
        }
        
        // Check if slot is available
        $availableSlots = DisabilityAssessment::getAvailableSlots($request->assessment_date);
        if (!in_array($request->slot_number, $availableSlots)) {
            return response()->json(['message' => 'This time slot is no longer available'], 400);
        }
        
        // Get application
        $application = Application::find($request->application_id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        
        // Check if assessment date is within application holding period
        if ($application->expires_at) {
            $assessmentDate = Carbon::parse($request->assessment_date);
            $expiresAt = Carbon::parse($application->expires_at);
            
            if ($assessmentDate->startOfDay()->isAfter($expiresAt->endOfDay())) {
                return response()->json([
                    'message' => 'Assessment date must be within the application holding period. The application expires on ' . $expiresAt->format('F j, Y') . '.',
                    'expires_at' => $expiresAt->format('Y-m-d')
                ], 400);
            }
        }
        
        // Check if assessment already exists
        $existingAssessment = DisabilityAssessment::where('application_id', $application->applicationID)->first();
        if ($existingAssessment) {
            // Update existing assessment - preserve disability_type if not already set
            $updateData = [
                'assessment_date' => $request->assessment_date,
                'slot_number' => $request->slot_number,
                'status' => DisabilityAssessment::STATUS_SCHEDULED
            ];
            
            // If disability_type is not set, populate from application
            if (empty($existingAssessment->disability_type) && !empty($application->disabilityType)) {
                $updateData['disability_type'] = $application->disabilityType;
            }
            // If disability_cause is not set, populate from application
            if (empty($existingAssessment->disability_cause) && !empty($application->disabilityCause)) {
                $updateData['disability_cause'] = $application->disabilityCause;
            }
            // If disability_onset_date is not set, populate from application
            if (empty($existingAssessment->disability_onset_date) && !empty($application->disabilityDate)) {
                $updateData['disability_onset_date'] = $application->disabilityDate;
            }
            
            $existingAssessment->update($updateData);
            $assessment = $existingAssessment;
        } else {
            // Create new assessment
            $assessment = DisabilityAssessment::create([
                'application_id' => $application->applicationID,
                'reference_number' => DisabilityAssessment::generateReferenceNumber(),
                'assessment_date' => $request->assessment_date,
                'slot_number' => $request->slot_number,
                'status' => DisabilityAssessment::STATUS_SCHEDULED,
                'applicant_name' => trim("{$application->firstName} {$application->middleName} {$application->lastName}"),
                'applicant_email' => $application->email,
                'applicant_contact' => $application->contactNumber,
                'disability_type' => $application->disabilityType,
                'disability_cause' => $application->disabilityCause,
                'disability_onset_date' => $application->disabilityDate
            ]);
        }
        
        // Update application assessment status
        $application->update(['assessment_status' => 'scheduled']);
        
        // Send scheduling email
        $this->sendSchedulingEmail($assessment);
        
        // Notify admins about scheduled assessment
        $this->notifyAdminsAboutScheduledAssessment($assessment);
        
        return response()->json([
            'message' => 'Assessment scheduled successfully',
            'assessment' => $assessment->load('application')
        ], 201);
    }

    /**
     * Create assessment after barangay approval (auto-triggered)
     */
    public function createPendingAssessment($applicationId)
    {
        $application = Application::find($applicationId);
        if (!$application) {
            return null;
        }
        
        // Check if assessment already exists
        $existingAssessment = DisabilityAssessment::where('application_id', $applicationId)->first();
        if ($existingAssessment) {
            return $existingAssessment;
        }
        
        // Create pending assessment
        $assessment = DisabilityAssessment::create([
            'application_id' => $application->applicationID,
            'reference_number' => DisabilityAssessment::generateReferenceNumber(),
            'status' => DisabilityAssessment::STATUS_PENDING,
            'applicant_name' => trim("{$application->firstName} {$application->middleName} {$application->lastName}"),
            'applicant_email' => $application->email,
            'applicant_contact' => $application->contactNumber,
            'disability_type' => $application->disabilityType,
            'disability_cause' => $application->disabilityCause,
            'disability_onset_date' => $application->disabilityDate
        ]);
        
        // Update application assessment status
        $application->update(['assessment_status' => 'pending']);
        
        // Send email with link to schedule
        $this->sendAssessmentInviteEmail($assessment);
        
        return $assessment;
    }

    /**
     * Applicant submits their assessment form
     */
    public function submitAssessmentForm(Request $request, $referenceNumber)
    {
        $assessment = DisabilityAssessment::where('reference_number', $referenceNumber)->first();
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        if ($assessment->status !== DisabilityAssessment::STATUS_SCHEDULED) {
            return response()->json(['message' => 'Assessment form can only be submitted for scheduled assessments'], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'disability_description' => 'required|string|min:20',
            'disability_severity' => 'required|in:mild,moderate,severe,profound',
            'functional_limitations' => 'nullable|array',
            'mobility_status' => 'nullable|string',
            'communication_ability' => 'nullable|string',
            'self_care_ability' => 'nullable|string',
            'learning_ability' => 'nullable|string',
            'assistive_devices_current' => 'nullable|array',
            'assistive_devices_needed' => 'nullable|array',
            'applicant_remarks' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $assessment->update([
            'disability_description' => $request->disability_description,
            'disability_severity' => $request->disability_severity,
            'functional_limitations' => $request->functional_limitations,
            'mobility_status' => $request->mobility_status,
            'communication_ability' => $request->communication_ability,
            'self_care_ability' => $request->self_care_ability,
            'learning_ability' => $request->learning_ability,
            'assistive_devices_current' => $request->assistive_devices_current,
            'assistive_devices_needed' => $request->assistive_devices_needed,
            'applicant_remarks' => $request->applicant_remarks
            // Status remains 'scheduled' - staff will update to 'completed' after review
        ]);
        
        return response()->json([
            'message' => 'Assessment form submitted successfully',
            'assessment' => $assessment
        ]);
    }

    /**
     * Staff/Admin updates assessment
     * Note: Assessment form can only be edited on the day of the scheduled assessment
     */
    public function updateAssessment(Request $request, $id)
    {
        $assessment = DisabilityAssessment::find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        // Check if assessment is already finalized
        if (in_array($assessment->status, [DisabilityAssessment::STATUS_FINALIZED, DisabilityAssessment::STATUS_UPLOADED])) {
            return response()->json([
                'message' => 'This assessment has been finalized and cannot be edited.'
            ], 400);
        }
        
        // Check if assessment has been scheduled
        if (!$assessment->assessment_date) {
            return response()->json([
                'message' => 'This assessment has not been scheduled yet. Please schedule an appointment first.'
            ], 400);
        }
        
        // Check if it's the day of the assessment
        $assessmentDate = Carbon::parse($assessment->assessment_date)->startOfDay();
        $today = Carbon::today();
        
        if (!$assessmentDate->equalTo($today)) {
            // Allow SuperAdmin to bypass this restriction
            if ($request->user()->role !== 'SuperAdmin') {
                $dateFormatted = $assessmentDate->format('F d, Y');
                
                if ($assessmentDate->isFuture()) {
                    return response()->json([
                        'message' => "This assessment form can only be edited on the day of the scheduled appointment ({$dateFormatted}). Please return on that date to complete the assessment."
                    ], 400);
                } else {
                    return response()->json([
                        'message' => "The scheduled assessment date ({$dateFormatted}) has passed. Please mark the appointment as missed and reschedule if needed."
                    ], 400);
                }
            }
        }
        
        // Check if status allows editing
        if (!in_array($assessment->status, [DisabilityAssessment::STATUS_SCHEDULED, DisabilityAssessment::STATUS_COMPLETED])) {
            return response()->json([
                'message' => 'This assessment cannot be edited in its current status: ' . $assessment->status
            ], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'disability_type' => 'nullable|string',
            'disability_description' => 'nullable|string',
            'disability_cause' => 'nullable|string',
            'disability_onset_date' => 'nullable|date',
            'disability_severity' => 'nullable|in:mild,moderate,severe,profound',
            'functional_limitations' => 'nullable|array',
            'mobility_status' => 'nullable|string',
            'communication_ability' => 'nullable|string',
            'self_care_ability' => 'nullable|string',
            'learning_ability' => 'nullable|string',
            'attending_physician' => 'nullable|string',
            'physician_license_no' => 'nullable|string',
            'medical_facility' => 'nullable|string',
            'medical_findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'assistive_devices_needed' => 'nullable|array',
            'assistive_devices_current' => 'nullable|array',
            'assessor_notes' => 'nullable|string',
            'status' => 'nullable|in:scheduled,completed,finalized'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $updateData = $request->only([
            'disability_type', 'disability_description', 'disability_cause',
            'disability_onset_date', 'disability_severity', 'functional_limitations',
            'mobility_status', 'communication_ability', 'self_care_ability',
            'learning_ability', 'attending_physician', 'physician_license_no',
            'medical_facility', 'medical_findings', 'recommendations',
            'assistive_devices_needed', 'assistive_devices_current', 'assessor_notes'
        ]);
        
        // If marking as completed, set assessed_by
        if ($request->status === 'completed' && $assessment->status !== 'completed') {
            $updateData['status'] = 'completed';
            $updateData['assessed_by'] = $request->user()->userID;
            $updateData['assessed_at'] = now();
            
            // Update application status
            $assessment->application->update(['assessment_status' => 'completed']);
        }
        
        $assessment->update($updateData);
        
        return response()->json([
            'message' => 'Assessment updated successfully',
            'assessment' => $assessment->load(['application', 'assessor'])
        ]);
    }

    /**
     * Finalize assessment and generate PDF
     * Note: Can only be done on the day of the assessment
     */
    public function finalizeAssessment(Request $request, $id)
    {
        try {
            // Load assessment with application and related data
            $assessment = DisabilityAssessment::with(['application', 'assessor', 'finalizer'])->find($id);
            
            if (!$assessment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Assessment not found'
                ], 404);
            }
            
            // Ensure application is loaded
            if (!$assessment->application) {
                Log::error('Assessment application not found', [
                    'assessment_id' => $id,
                    'application_id' => $assessment->application_id
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found for this assessment. Cannot finalize without application data.'
                ], 404);
            }
            
            // Auto-mark as completed if not already completed (for PDF generation)
            if ($assessment->status !== DisabilityAssessment::STATUS_COMPLETED) {
                $assessment->update([
                    'status' => DisabilityAssessment::STATUS_COMPLETED,
                    'assessed_by' => $request->user()->userID,
                    'assessed_at' => now()
                ]);
                $assessment->refresh();
            }
            
            // Allow finalization regardless of date (removed date restriction for PDF generation)
            
            // Generate PDF with error handling
            try {
                $pdf = $this->generateAssessmentPDF($assessment);
            } catch (\Exception $e) {
                Log::error('Failed to generate assessment PDF', [
                    'assessment_id' => $id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Failed to generate PDF. Please check the assessment data and try again.',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            // Save PDF with error handling
            try {
                $filename = "assessment_{$assessment->reference_number}.pdf";
                $path = "assessments/pdfs/{$filename}";
                
                // Ensure directory exists
                $directory = dirname(storage_path('app/public/' . $path));
                if (!is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }
                
                Storage::disk('public')->put($path, $pdf->output());
            } catch (\Exception $e) {
                Log::error('Failed to save assessment PDF', [
                    'assessment_id' => $id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Failed to save PDF. Please try again.',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            // Update assessment in database
            try {
                $assessment->update([
                    'status' => DisabilityAssessment::STATUS_FINALIZED,
                    'finalized_by' => $request->user()->userID,
                    'finalized_at' => now(),
                    'pdf_path' => $path,
                    'pdf_generated_at' => now()
                ]);
                
                // Refresh to get updated data
                $assessment->refresh();
            } catch (\Exception $e) {
                Log::error('Failed to update assessment status', [
                    'assessment_id' => $id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Failed to update assessment status. PDF was generated but status update failed.',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            // Update application status in database
            try {
                $application = $assessment->application;
                $application->update([
                    'assessment_status' => 'finalized',
                    'assessment_pdf_path' => $path,
                    'status' => 'Pending Admin Approval' // Set to Pending Admin Approval so it's ready for approval
                ]);
                
                Log::info('Application status updated after assessment finalization - ready for approval', [
                    'application_id' => $application->applicationID,
                    'assessment_id' => $id,
                    'new_status' => 'Pending Admin Approval'
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to update application status', [
                    'application_id' => $assessment->application_id,
                    'assessment_id' => $id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Don't fail the request if application update fails, but log it
            }
            
            // Send notifications to relevant users
            try {
                $this->sendFinalizationNotifications($assessment, $request->user());
            } catch (\Exception $e) {
                Log::error('Failed to send finalization notifications', [
                    'assessment_id' => $id,
                    'error' => $e->getMessage()
                ]);
                // Don't fail the request if notifications fail
            }
            
            // Get the PDF URL
            $pdfUrl = Storage::disk('public')->url($path);
            
            // If URL doesn't start with http, make it absolute
            if (!str_starts_with($pdfUrl, 'http')) {
                $baseUrl = config('app.url', 'http://localhost:8000');
                $pdfUrl = rtrim($baseUrl, '/') . '/' . ltrim($pdfUrl, '/');
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Assessment finalized successfully. PDF generated.',
                'assessment' => $assessment->load(['application', 'assessor', 'finalizer']),
                'pdf_url' => $pdfUrl,
                'pdf_path' => $path
            ]);
        } catch (\Exception $e) {
            Log::error('Unexpected error in finalizeAssessment', [
                'assessment_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while finalizing the assessment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download assessment PDF
     */
    public function downloadPDF($id)
    {
        $assessment = DisabilityAssessment::find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        if (!$assessment->pdf_path || !Storage::disk('public')->exists($assessment->pdf_path)) {
            // Generate PDF on the fly if not exists
            $pdf = $this->generateAssessmentPDF($assessment);
            return $pdf->download("assessment_{$assessment->reference_number}.pdf");
        }
        
        return Storage::disk('public')->download(
            $assessment->pdf_path,
            "assessment_{$assessment->reference_number}.pdf"
        );
    }

    /**
     * Get today's scheduled assessments
     */
    public function getTodayScheduled()
    {
        $assessments = DisabilityAssessment::with('application')
            ->today()
            ->orderBy('slot_number')
            ->get();
        
        return response()->json($assessments);
    }

    /**
     * Get upcoming assessments
     */
    public function getUpcoming()
    {
        $assessments = DisabilityAssessment::with('application')
            ->upcoming()
            ->limit(20)
            ->get();
        
        return response()->json($assessments);
    }

    /**
     * Generate assessment PDF
     */
    private function generateAssessmentPDF($assessment)
    {
        // Ensure application is loaded
        if (!$assessment->relationLoaded('application')) {
            $assessment->load('application');
        }
        
        if (!$assessment->application) {
            throw new \Exception('Application not found for this assessment. Cannot generate PDF.');
        }
        
        try {
            $data = [
                'assessment' => $assessment,
                'application' => $assessment->application,
                'timeSlots' => DisabilityAssessment::getTimeSlots(),
                'generatedAt' => now()->format('F d, Y h:i A')
            ];
            
            // Use PDF generator - use app() helper to resolve the facade
            $pdf = app('dompdf.wrapper')->loadView('pdfs.disability-assessment', $data);
            $pdf->setPaper('letter', 'portrait');
            
            return $pdf;
        } catch (\Exception $e) {
            Log::error('Error in generateAssessmentPDF', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Send assessment invite email (after barangay approval)
     */
    private function sendAssessmentInviteEmail($assessment)
    {
        if (!$assessment->applicant_email) {
            Log::warning('No email address for assessment invite', ['assessment_id' => $assessment->id]);
            return;
        }
        
        try {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $scheduleLink = "{$frontendUrl}/disability-assessment/schedule/{$assessment->reference_number}";
            
            Mail::send('emails.assessment-invite', [
                'assessment' => $assessment,
                'scheduleLink' => $scheduleLink
            ], function ($message) use ($assessment) {
                $message->to($assessment->applicant_email, $assessment->applicant_name)
                    ->subject('PWD Application - Disability Assessment Scheduling');
            });
            
            $assessment->update(['scheduling_email_sent_at' => now()]);
            
            Log::info('Assessment invite email sent', ['assessment_id' => $assessment->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment invite email', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send notifications when assessment is finalized
     */
    private function sendFinalizationNotifications($assessment, $finalizedBy)
    {
        try {
            $application = $assessment->application;
            $applicantName = $assessment->applicant_name;
            $finalizerName = $finalizedBy->username ?? 'Admin';
            
            // Notify the applicant (PWD Member) if they have a user account
            if ($application && $application->pwdID) {
                try {
                    NotificationService::create(
                        $application->pwdID,
                        'assessment_finalized',
                        'Disability Assessment Finalized',
                        "Your disability assessment (Ref: {$assessment->reference_number}) has been finalized. The assessment PDF is now available for review.",
                        [
                            'assessment_id' => $assessment->id,
                            'reference_number' => $assessment->reference_number,
                            'applicant_name' => $applicantName,
                            'finalized_by' => $finalizerName,
                            'finalized_at' => $assessment->finalized_at ? $assessment->finalized_at->toIso8601String() : null,
                            'pdf_path' => $assessment->pdf_path,
                            'timestamp' => now()->toIso8601String()
                        ]
                    );
                } catch (\Exception $e) {
                    Log::error('Failed to notify applicant about assessment finalization', [
                        'assessment_id' => $assessment->id,
                        'pwd_id' => $application->pwdID,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // Notify all Admins and SuperAdmins
            try {
                NotificationService::notifyAdmins(
                    'assessment_finalized',
                    'Disability Assessment Finalized',
                    "Disability assessment for {$applicantName} (Ref: {$assessment->reference_number}) has been finalized by {$finalizerName}. The assessment PDF is ready for review.",
                    [
                        'assessment_id' => $assessment->id,
                        'reference_number' => $assessment->reference_number,
                        'applicant_name' => $applicantName,
                        'application_id' => $application->applicationID ?? null,
                        'finalized_by' => $finalizedBy->userID,
                        'finalizer_name' => $finalizerName,
                        'finalized_at' => $assessment->finalized_at?->toIso8601String(),
                        'pdf_path' => $assessment->pdf_path,
                        'timestamp' => now()->toIso8601String()
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Failed to notify admins about assessment finalization', [
                    'assessment_id' => $assessment->id,
                    'error' => $e->getMessage()
                ]);
            }
            
            // Notify Barangay President if application has a barangay
            if ($application && $application->barangay) {
                try {
                    // Use BarangayPresident model directly to avoid relationship issues
                    $barangayPresidents = BarangayPresident::where('barangay', $application->barangay)
                        ->pluck('userID')
                        ->toArray();
                    
                    if (!empty($barangayPresidents)) {
                        NotificationService::createMultiple(
                            $barangayPresidents,
                            'assessment_finalized',
                            'Disability Assessment Finalized',
                            "Disability assessment for {$applicantName} from {$application->barangay} (Ref: {$assessment->reference_number}) has been finalized. The assessment PDF is ready for review.",
                            [
                                'assessment_id' => $assessment->id,
                                'reference_number' => $assessment->reference_number,
                                'applicant_name' => $applicantName,
                                'barangay' => $application->barangay,
                                'application_id' => $application->applicationID ?? null,
                                'finalized_by' => $finalizedBy->userID,
                                'finalizer_name' => $finalizerName,
                                'finalized_at' => $assessment->finalized_at ? $assessment->finalized_at->toIso8601String() : null,
                                'pdf_path' => $assessment->pdf_path,
                                'timestamp' => now()->toIso8601String()
                            ]
                        );
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to notify barangay president about assessment finalization', [
                        'assessment_id' => $assessment->id,
                        'barangay' => $application->barangay ?? 'N/A',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }
            
            Log::info('Finalization notifications sent successfully', [
                'assessment_id' => $assessment->id,
                'reference_number' => $assessment->reference_number
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending finalization notifications', [
                'assessment_id' => $assessment->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Send scheduling confirmation email
     */
    private function sendSchedulingEmail($assessment)
    {
        if (!$assessment->applicant_email) {
            return;
        }
        
        try {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $formLink = "{$frontendUrl}/disability-assessment/form/{$assessment->reference_number}";
            $timeSlots = DisabilityAssessment::getTimeSlots();
            
            Mail::send('emails.assessment-scheduled', [
                'assessment' => $assessment,
                'formLink' => $formLink,
                'timeSlot' => $timeSlots[$assessment->slot_number] ?? 'TBD'
            ], function ($message) use ($assessment) {
                $message->to($assessment->applicant_email, $assessment->applicant_name)
                    ->subject('PWD Application - Disability Assessment Scheduled');
            });
            
            Log::info('Assessment scheduling email sent', ['assessment_id' => $assessment->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment scheduling email', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Mark assessment as missed
     */
    public function markAsMissed(Request $request, $id)
    {
        $assessment = DisabilityAssessment::find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        if ($assessment->status !== DisabilityAssessment::STATUS_SCHEDULED) {
            return response()->json(['message' => 'Only scheduled assessments can be marked as missed'], 400);
        }
        
        // Mark as missed
        $assessment->markAsMissed($request->user()->userID);
        
        // Update application status
        $assessment->application->update(['assessment_status' => 'pending']);
        
        // Send missed appointment email with reschedule link
        $this->sendMissedAppointmentEmail($assessment);
        
        return response()->json([
            'message' => 'Assessment marked as missed',
            'assessment' => $assessment->load('application'),
            'can_reschedule' => $assessment->canReschedule()
        ]);
    }

    /**
     * Mark attendance as present
     */
    public function markAsPresent(Request $request, $id)
    {
        $assessment = DisabilityAssessment::find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        if ($assessment->status !== DisabilityAssessment::STATUS_SCHEDULED) {
            return response()->json(['message' => 'Only scheduled assessments can be marked as present'], 400);
        }
        
        $assessment->markAsPresent($request->user()->userID);
        
        return response()->json([
            'message' => 'Attendance marked as present',
            'assessment' => $assessment->load('application')
        ]);
    }

    /**
     * Reschedule assessment (public endpoint via token)
     */
    public function rescheduleWithToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'new_date' => 'required|date|after_or_equal:today',
            'slot_number' => 'required|integer|min:1|max:10'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Find assessment by token
        $assessment = DisabilityAssessment::where('reschedule_token', $request->token)->first();
        
        if (!$assessment) {
            return response()->json(['message' => 'Invalid reschedule link'], 404);
        }
        
        // Check if token is valid
        if (!$assessment->isRescheduleTokenValid($request->token)) {
            return response()->json(['message' => 'This reschedule link has expired'], 400);
        }
        
        // Check if can reschedule
        if (!$assessment->canReschedule()) {
            return response()->json([
                'message' => 'You have already used your reschedule opportunity. Please contact the office for assistance.'
            ], 400);
        }
        
        // Check if date is a weekend
        $newDate = Carbon::parse($request->new_date);
        if ($newDate->isWeekend()) {
            return response()->json([
                'message' => 'Assessments cannot be scheduled on weekends. Please select a weekday.'
            ], 400);
        }
        
        // Check if new date is within application holding period
        $application = Application::find($assessment->application_id);
        if ($application && $application->expires_at) {
            $expiresAt = Carbon::parse($application->expires_at);
            if ($newDate->startOfDay()->isAfter($expiresAt->endOfDay())) {
                return response()->json([
                    'message' => 'Assessment date must be within the application holding period. The application expires on ' . $expiresAt->format('F j, Y') . '.',
                    'expires_at' => $expiresAt->format('Y-m-d')
                ], 400);
            }
        }
        
        // Check if new slot is available
        $availableSlots = DisabilityAssessment::getAvailableSlots($request->new_date);
        if (!in_array($request->slot_number, $availableSlots)) {
            return response()->json(['message' => 'This time slot is no longer available'], 400);
        }
        
        // Store original date if not already stored
        if (!$assessment->original_assessment_date) {
            $assessment->original_assessment_date = $assessment->assessment_date;
            $assessment->original_slot_number = $assessment->slot_number;
        }
        
        // Update assessment
        $assessment->update([
            'assessment_date' => $request->new_date,
            'slot_number' => $request->slot_number,
            'status' => DisabilityAssessment::STATUS_SCHEDULED,
            'is_missed' => false,
            'reschedule_count' => $assessment->reschedule_count + 1,
            'last_rescheduled_at' => now(),
            'attendance_status' => DisabilityAssessment::ATTENDANCE_PENDING,
            'reschedule_token' => null, // Invalidate token after use
            'reschedule_token_expires_at' => null
        ]);
        
        // Update application status
        $assessment->application->update(['assessment_status' => 'scheduled']);
        
        // Send new scheduling confirmation email
        $this->sendReschedulingConfirmationEmail($assessment);
        
        // Notify admins about rescheduled assessment (applicant rescheduled via token)
        $this->notifyAdminsAboutRescheduledAssessment($assessment, true);
        
        return response()->json([
            'message' => 'Assessment rescheduled successfully',
            'assessment' => $assessment->load('application')
        ]);
    }

    /**
     * Admin/staff reschedule assessment
     */
    public function rescheduleByAdmin(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'new_date' => 'required|date|after_or_equal:today',
            'slot_number' => 'required|integer|min:1|max:10',
            'reason' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $assessment = DisabilityAssessment::find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        // Check if assessment can be rescheduled (not finalized/uploaded)
        if (in_array($assessment->status, [DisabilityAssessment::STATUS_FINALIZED, DisabilityAssessment::STATUS_UPLOADED])) {
            return response()->json([
                'message' => 'This assessment has been finalized and cannot be rescheduled.'
            ], 400);
        }
        
        // Check if date is a weekend
        $newDate = Carbon::parse($request->new_date);
        if ($newDate->isWeekend()) {
            return response()->json([
                'message' => 'Assessments cannot be scheduled on weekends. Please select a weekday.'
            ], 400);
        }
        
        // Check if new date is within application holding period
        $application = Application::find($assessment->application_id);
        if ($application && $application->expires_at) {
            $expiresAt = Carbon::parse($application->expires_at);
            if ($newDate->startOfDay()->isAfter($expiresAt->endOfDay())) {
                return response()->json([
                    'message' => 'Assessment date must be within the application holding period. The application expires on ' . $expiresAt->format('F j, Y') . '.',
                    'expires_at' => $expiresAt->format('Y-m-d')
                ], 400);
            }
        }
        
        // Check if new slot is available
        $availableSlots = DisabilityAssessment::getAvailableSlots($request->new_date);
        if (!in_array($request->slot_number, $availableSlots)) {
            return response()->json(['message' => 'This time slot is no longer available'], 400);
        }
        
        // Store original date if not already stored
        if (!$assessment->original_assessment_date) {
            $assessment->original_assessment_date = $assessment->assessment_date;
            $assessment->original_slot_number = $assessment->slot_number;
        }
        
        // Update assessment (admin reschedule doesn't count against user's limit)
        $assessment->update([
            'assessment_date' => $request->new_date,
            'slot_number' => $request->slot_number,
            'status' => DisabilityAssessment::STATUS_SCHEDULED,
            'is_missed' => false,
            'last_rescheduled_at' => now(),
            'attendance_status' => DisabilityAssessment::ATTENDANCE_PENDING,
            'assessor_notes' => $assessment->assessor_notes . "\n[Admin Rescheduled: " . now()->format('Y-m-d H:i') . "] " . ($request->reason ?? 'No reason provided')
        ]);
        
        // Update application status
        $assessment->application->update(['assessment_status' => 'scheduled']);
        
        // Send new scheduling confirmation email
        $this->sendReschedulingConfirmationEmail($assessment);
        
        // Notify admins about rescheduled assessment (applicant rescheduled)
        $this->notifyAdminsAboutRescheduledAssessment($assessment, true);
        
        return response()->json([
            'message' => 'Assessment rescheduled successfully',
            'assessment' => $assessment->load('application')
        ]);
    }

    /**
     * Get assessment by reschedule token (for public reschedule page)
     */
    public function getByRescheduleToken($token)
    {
        $assessment = DisabilityAssessment::where('reschedule_token', $token)
            ->with('application')
            ->first();
        
        if (!$assessment) {
            return response()->json(['message' => 'Invalid reschedule link'], 404);
        }
        
        if (!$assessment->isRescheduleTokenValid($token)) {
            return response()->json(['message' => 'This reschedule link has expired'], 400);
        }
        
        if (!$assessment->canReschedule()) {
            return response()->json([
                'message' => 'You have already used your reschedule opportunity',
                'can_reschedule' => false
            ], 400);
        }
        
        return response()->json([
            'assessment' => [
                'id' => $assessment->id,
                'reference_number' => $assessment->reference_number,
                'applicant_name' => $assessment->applicant_name,
                'original_date' => $assessment->original_assessment_date ?? $assessment->assessment_date,
                'missed_date' => $assessment->assessment_date,
                'reschedule_count' => $assessment->reschedule_count,
                'max_reschedule_allowed' => $assessment->max_reschedule_allowed
            ],
            'can_reschedule' => true
        ]);
    }

    /**
     * Upload PDF after finalization
     */
    public function uploadPDF(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'pdf' => 'required|file|mimes:pdf|max:10240'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $assessment = DisabilityAssessment::find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        if (!in_array($assessment->status, [DisabilityAssessment::STATUS_FINALIZED, DisabilityAssessment::STATUS_COMPLETED])) {
            return response()->json(['message' => 'Assessment must be completed or finalized before uploading PDF'], 400);
        }
        
        // Store PDF
        $filename = "assessment_{$assessment->reference_number}_uploaded.pdf";
        $path = $request->file('pdf')->storeAs('assessments/pdfs', $filename, 'public');
        
        // Update assessment
        $assessment->update([
            'pdf_path' => $path,
            'status' => DisabilityAssessment::STATUS_UPLOADED
        ]);
        
        // Load application relationship if not loaded
        if (!$assessment->relationLoaded('application')) {
            $assessment->load('application');
        }
        
        // Update application status to make it ready for approval
        if ($assessment->application) {
            $assessment->application->update([
                'assessment_status' => 'uploaded',
                'assessment_pdf_path' => $path,
                'status' => 'Pending Admin Approval' // Set to Pending Admin Approval so it's ready for approval
            ]);
            
            Log::info('Application status updated after PDF upload - ready for approval', [
                'application_id' => $assessment->application->applicationID,
                'assessment_id' => $id,
                'new_status' => 'Pending Admin Approval'
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'PDF uploaded successfully. Application is now ready for approval.',
            'assessment' => $assessment->load('application'),
            'pdf_url' => Storage::disk('public')->url($path)
        ]);
    }

    /**
     * Check missed appointments (to be called by scheduler)
     */
    public function checkMissedAppointments()
    {
        $missedAssessments = DisabilityAssessment::needsMissedCheck()->get();
        
        $processed = 0;
        foreach ($missedAssessments as $assessment) {
            $assessment->markAsMissed();
            $this->sendMissedAppointmentEmail($assessment);
            $processed++;
        }
        
        return response()->json([
            'message' => "Processed {$processed} missed appointments",
            'count' => $processed
        ]);
    }

    /**
     * Get assessment statistics
     */
    public function getStatistics()
    {
        $stats = [
            'total' => DisabilityAssessment::count(),
            'pending' => DisabilityAssessment::where('status', DisabilityAssessment::STATUS_PENDING)->count(),
            'scheduled' => DisabilityAssessment::where('status', DisabilityAssessment::STATUS_SCHEDULED)->count(),
            'completed' => DisabilityAssessment::where('status', DisabilityAssessment::STATUS_COMPLETED)->count(),
            'finalized' => DisabilityAssessment::where('status', DisabilityAssessment::STATUS_FINALIZED)->count(),
            'uploaded' => DisabilityAssessment::where('status', DisabilityAssessment::STATUS_UPLOADED)->count(),
            'missed' => DisabilityAssessment::where('status', DisabilityAssessment::STATUS_MISSED)->count(),
            'rescheduled_count' => DisabilityAssessment::where('reschedule_count', '>', 0)->count(),
            'today_scheduled' => DisabilityAssessment::today()->count(),
            'today_slots_remaining' => 10 - DisabilityAssessment::getAppointmentCount(today())
        ];
        
        return response()->json($stats);
    }

    /**
     * Send missed appointment email
     */
    private function sendMissedAppointmentEmail($assessment)
    {
        if (!$assessment->applicant_email) {
            return;
        }
        
        try {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $rescheduleLink = null;
            
            if ($assessment->canReschedule() && $assessment->reschedule_token) {
                $rescheduleLink = "{$frontendUrl}/disability-assessment/reschedule/{$assessment->reschedule_token}";
            }
            
            $timeSlots = DisabilityAssessment::getTimeSlots();
            
            Mail::send('emails.assessment-missed', [
                'assessment' => $assessment,
                'rescheduleLink' => $rescheduleLink,
                'canReschedule' => $assessment->canReschedule(),
                'missedDate' => $assessment->assessment_date->format('F d, Y'),
                'missedTime' => $timeSlots[$assessment->slot_number] ?? 'N/A'
            ], function ($message) use ($assessment) {
                $message->to($assessment->applicant_email, $assessment->applicant_name)
                    ->subject('PWD Application - Missed Disability Assessment Appointment');
            });
            
            $assessment->update(['missed_email_sent_at' => now()]);
            
            Log::info('Missed appointment email sent', ['assessment_id' => $assessment->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send missed appointment email', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send rescheduling confirmation email
     */
    private function sendReschedulingConfirmationEmail($assessment)
    {
        if (!$assessment->applicant_email) {
            return;
        }
        
        try {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $formLink = "{$frontendUrl}/disability-assessment/form/{$assessment->reference_number}";
            $timeSlots = DisabilityAssessment::getTimeSlots();
            
            Mail::send('emails.assessment-rescheduled', [
                'assessment' => $assessment,
                'formLink' => $formLink,
                'timeSlot' => $timeSlots[$assessment->slot_number] ?? 'TBD',
                'newDate' => $assessment->assessment_date->format('F d, Y'),
                'originalDate' => $assessment->original_assessment_date ? $assessment->original_assessment_date->format('F d, Y') : 'N/A'
            ], function ($message) use ($assessment) {
                $message->to($assessment->applicant_email, $assessment->applicant_name)
                    ->subject('PWD Application - Disability Assessment Rescheduled');
            });
            
            Log::info('Rescheduling confirmation email sent', ['assessment_id' => $assessment->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send rescheduling confirmation email', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notify admins about scheduled assessment
     */
    private function notifyAdminsAboutScheduledAssessment($assessment)
    {
        try {
            $timeSlots = DisabilityAssessment::getTimeSlots();
            $timeSlot = $timeSlots[$assessment->slot_number] ?? 'TBD';
            $assessmentDate = Carbon::parse($assessment->assessment_date)->format('F d, Y');
            
            NotificationService::notifyAdmins(
                'assessment_scheduled',
                'Disability Assessment Scheduled',
                "A disability assessment has been scheduled for {$assessment->applicant_name} (Ref: {$assessment->reference_number}). Date: {$assessmentDate} at {$timeSlot}",
                [
                    'assessment_id' => $assessment->id,
                    'reference_number' => $assessment->reference_number,
                    'applicant_name' => $assessment->applicant_name,
                    'application_id' => $assessment->application_id,
                    'assessment_date' => $assessment->assessment_date,
                    'slot_number' => $assessment->slot_number,
                    'time_slot' => $timeSlot,
                    'timestamp' => now()->toIso8601String()
                ]
            );
            
            Log::info('Admin notification sent for scheduled assessment', [
                'assessment_id' => $assessment->id,
                'reference_number' => $assessment->reference_number
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification for scheduled assessment', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notify admins about rescheduled assessment
     */
    private function notifyAdminsAboutRescheduledAssessment($assessment, $isApplicantReschedule = false)
    {
        try {
            $timeSlots = DisabilityAssessment::getTimeSlots();
            $timeSlot = $timeSlots[$assessment->slot_number] ?? 'TBD';
            $newDate = Carbon::parse($assessment->assessment_date)->format('F d, Y');
            $originalDate = $assessment->original_assessment_date 
                ? Carbon::parse($assessment->original_assessment_date)->format('F d, Y') 
                : 'N/A';
            
            $rescheduledBy = $isApplicantReschedule ? 'applicant' : 'admin';
            $title = 'Disability Assessment Rescheduled';
            $message = "A disability assessment has been rescheduled for {$assessment->applicant_name} (Ref: {$assessment->reference_number}). ";
            $message .= "New Date: {$newDate} at {$timeSlot}";
            if ($originalDate !== 'N/A') {
                $message .= " (Originally: {$originalDate})";
            }
            $message .= ". Rescheduled by: " . ($isApplicantReschedule ? 'Applicant' : 'Admin');
            
            NotificationService::notifyAdmins(
                'assessment_rescheduled',
                $title,
                $message,
                [
                    'assessment_id' => $assessment->id,
                    'reference_number' => $assessment->reference_number,
                    'applicant_name' => $assessment->applicant_name,
                    'application_id' => $assessment->application_id,
                    'new_assessment_date' => $assessment->assessment_date,
                    'original_assessment_date' => $assessment->original_assessment_date,
                    'slot_number' => $assessment->slot_number,
                    'time_slot' => $timeSlot,
                    'rescheduled_by' => $rescheduledBy,
                    'timestamp' => now()->toIso8601String()
                ]
            );
            
            Log::info('Admin notification sent for rescheduled assessment', [
                'assessment_id' => $assessment->id,
                'reference_number' => $assessment->reference_number,
                'rescheduled_by' => $rescheduledBy
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification for rescheduled assessment', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}

