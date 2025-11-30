<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DisabilityAssessment;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

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
        
        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('assessment_date', $request->date);
        }
        
        // Filter by date range
        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('assessment_date', [$request->from_date, $request->to_date]);
        }
        
        $assessments = $query->orderBy('assessment_date', 'desc')
            ->orderBy('slot_number')
            ->paginate($request->per_page ?? 20);
        
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
        
        return response()->json($dates);
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
        
        // Check if assessment already exists
        $existingAssessment = DisabilityAssessment::where('application_id', $application->applicationID)->first();
        if ($existingAssessment) {
            // Update existing assessment
            $existingAssessment->update([
                'assessment_date' => $request->assessment_date,
                'slot_number' => $request->slot_number,
                'status' => DisabilityAssessment::STATUS_SCHEDULED
            ]);
            
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
     */
    public function updateAssessment(Request $request, $id)
    {
        $assessment = DisabilityAssessment::find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
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
     */
    public function finalizeAssessment(Request $request, $id)
    {
        $assessment = DisabilityAssessment::with('application')->find($id);
        
        if (!$assessment) {
            return response()->json(['message' => 'Assessment not found'], 404);
        }
        
        if ($assessment->status !== DisabilityAssessment::STATUS_COMPLETED) {
            return response()->json(['message' => 'Only completed assessments can be finalized'], 400);
        }
        
        // Generate PDF
        $pdf = $this->generateAssessmentPDF($assessment);
        
        // Save PDF
        $filename = "assessment_{$assessment->reference_number}.pdf";
        $path = "assessments/pdfs/{$filename}";
        Storage::disk('public')->put($path, $pdf->output());
        
        // Update assessment
        $assessment->update([
            'status' => DisabilityAssessment::STATUS_FINALIZED,
            'finalized_by' => $request->user()->userID,
            'finalized_at' => now(),
            'pdf_path' => $path,
            'pdf_generated_at' => now()
        ]);
        
        // Update application status
        $assessment->application->update([
            'assessment_status' => 'finalized',
            'assessment_pdf_path' => $path
        ]);
        
        return response()->json([
            'message' => 'Assessment finalized successfully',
            'assessment' => $assessment->load(['application', 'assessor', 'finalizer']),
            'pdf_url' => Storage::disk('public')->url($path)
        ]);
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
        $data = [
            'assessment' => $assessment,
            'application' => $assessment->application,
            'timeSlots' => DisabilityAssessment::getTimeSlots(),
            'generatedAt' => now()->format('F d, Y h:i A')
        ];
        
        $pdf = PDF::loadView('pdfs.disability-assessment', $data);
        $pdf->setPaper('letter', 'portrait');
        
        return $pdf;
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
}

