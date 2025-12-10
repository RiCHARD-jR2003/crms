<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\IDClaim;
use App\Models\PWDMember;
use App\Models\Notification;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IDClaimController extends Controller
{
    /**
     * Get all ID claims with filtering
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');
        $claimType = $request->query('claim_type', 'all');
        $date = $request->query('date');

        $query = IDClaim::with(['member', 'processor', 'releaser']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($claimType !== 'all') {
            $query->where('claim_type', $claimType);
        }

        if ($date) {
            $query->whereDate('scheduled_pickup_date', $date);
        }

        $claims = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'claims' => $claims,
            'counts' => [
                'total' => IDClaim::count(),
                'pending' => IDClaim::where('status', 'pending')->count(),
                'processing' => IDClaim::where('status', 'processing')->count(),
                'ready_for_pickup' => IDClaim::where('status', 'ready_for_pickup')->count(),
                'scheduled' => IDClaim::where('status', 'scheduled')->count(),
                'claimed' => IDClaim::where('status', 'claimed')->count(),
                'today_scheduled' => IDClaim::scheduledToday()->count()
            ]
        ]);
    }

    /**
     * Initiate a new ID claim (Step 1: Start the claiming process)
     */
    public function initiateClaim(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_id' => 'required',
            'claim_type' => 'required|in:new,renewal'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Find member - try userID first, then database id
        $member = PWDMember::where('userID', $request->member_id)->first();
        if (!$member) {
            // Try finding by database id
            $member = PWDMember::find($request->member_id);
        }
        
        // If still not found, try to find by any matching field
        if (!$member) {
            $member = PWDMember::where('id', $request->member_id)
                ->orWhere('userID', $request->member_id)
                ->first();
        }

        if (!$member) {
            \Illuminate\Support\Facades\Log::warning('Member not found for ID claim initiation', [
                'requested_member_id' => $request->member_id,
                'claim_type' => $request->claim_type
            ]);
            return response()->json([
                'success' => false,
                'message' => 'PWD Member not found. Please ensure the member exists and try again.'
            ], 404);
        }

        // Check for existing pending/processing claim
        $existingClaim = IDClaim::where('member_id', $member->userID)
            ->whereIn('status', ['pending', 'processing', 'ready_for_pickup', 'scheduled'])
            ->first();

        if ($existingClaim) {
            return response()->json([
                'success' => false,
                'message' => 'Member already has an active claim in progress',
                'existing_claim' => $existingClaim
            ], 400);
        }

        // For new claims, check if card is already claimed
        if ($request->claim_type === 'new' && $member->cardClaimed) {
            return response()->json([
                'success' => false,
                'message' => 'Card has already been claimed. Use renewal instead.'
            ], 400);
        }

        // For renewals, check if card exists
        if ($request->claim_type === 'renewal' && !$member->cardClaimed) {
            return response()->json([
                'success' => false,
                'message' => 'No existing card to renew. Use new claim instead.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $claim = IDClaim::create([
                'member_id' => $member->userID,
                'claim_type' => $request->claim_type,
                'status' => 'pending',
                'processed_by' => $request->user()->userID,
                'processed_at' => now()
            ]);

            // Create notification for member
            \App\Services\NotificationService::create(
                $member->userID,
                'id_claim_initiated',
                $request->claim_type === 'new' ? 'ID Claim Started' : 'ID Renewal Started',
                'Your PWD ID ' . ($request->claim_type === 'new' ? 'claim' : 'renewal') . ' has been initiated. Please wait for further instructions.',
                [
                    'claim_id' => $claim->id,
                    'claim_type' => $request->claim_type
                ]
            );

            // Notify admins about new ID claim initiated
            try {
                $memberName = trim(($member->firstName ?? '') . ' ' . ($member->lastName ?? ''));
                \App\Services\NotificationService::notifyAdmins(
                    'id_claiming',
                    'New ID Claim Initiated',
                    "A new ID " . ($request->claim_type === 'new' ? 'claim' : 'renewal') . " has been initiated for {$memberName} (PWD ID: {$member->pwd_id ?? 'N/A'}). Claim ID: {$claim->id}",
                    [
                        'claim_id' => $claim->id,
                        'claim_type' => $request->claim_type,
                        'member_id' => $member->userID,
                        'member_name' => $memberName,
                        'pwd_id' => $member->pwd_id ?? 'N/A',
                        'processed_by' => $request->user()->userID,
                        'timestamp' => now()->toIso8601String()
                    ]
                );
            } catch (\Exception $notifError) {
                \Illuminate\Support\Facades\Log::error('Failed to send admin notification for ID claim', [
                    'claim_id' => $claim->id,
                    'error' => $notifError->getMessage()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Claim initiated successfully',
                'claim' => $claim->load('member')
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            \Illuminate\Support\Facades\Log::error('Error initiating ID claim', [
                'member_id' => $request->member_id,
                'claim_type' => $request->claim_type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate claim: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update claim status (Step 2: Process through stages)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,ready_for_pickup,scheduled,claimed,cancelled',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $claim = IDClaim::with('member')->findOrFail($id);
        $oldStatus = $claim->status;
        $newStatus = $request->status;

        DB::beginTransaction();
        try {
            $updateData = [
                'status' => $newStatus,
                'notes' => $request->notes ?? $claim->notes
            ];

            // Handle status-specific updates
            if ($newStatus === 'processing' && $oldStatus === 'pending') {
                $updateData['processed_by'] = $request->user()->userID;
                $updateData['processed_at'] = now();
            }

            if ($newStatus === 'ready_for_pickup') {
                // Card is ready notification
                $this->notifyMember($claim, 'id_ready_for_pickup', 
                    'ID Card Ready for Pickup',
                    'Your PWD ID card is ready for pickup. Please visit the office during business hours.'
                );
            }

            $claim->update($updateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'claim' => $claim->fresh(['member', 'processor'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Schedule pickup appointment
     */
    public function schedulePickup(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'scheduled_pickup_date' => 'required|date|after_or_equal:today',
            'scheduled_pickup_time' => 'nullable|date_format:H:i',
            'scheduling_notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $claim = IDClaim::with('member')->findOrFail($id);

        if (!in_array($claim->status, ['pending', 'processing', 'ready_for_pickup', 'scheduled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot schedule pickup for this claim status'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $claim->update([
                'status' => 'scheduled',
                'scheduled_pickup_date' => $request->scheduled_pickup_date,
                'scheduled_pickup_time' => $request->scheduled_pickup_time,
                'scheduling_notes' => $request->scheduling_notes
            ]);

            $pickupDate = Carbon::parse($request->scheduled_pickup_date)->format('F d, Y');
            $pickupTime = $request->scheduled_pickup_time ? Carbon::parse($request->scheduled_pickup_time)->format('g:i A') : 'during business hours';

            $this->notifyMember($claim, 'id_pickup_scheduled',
                'Pickup Appointment Scheduled',
                "Your PWD ID card pickup has been scheduled for {$pickupDate} at {$pickupTime}. Please bring a valid ID."
            );

            // Send email notification
            $this->sendPickupScheduleEmail($claim, $pickupDate, $pickupTime);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pickup scheduled successfully',
                'claim' => $claim->fresh(['member'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule pickup',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Record claimant information and complete claim (Final step)
     */
    public function completeClaim(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'claimant_type' => 'required|in:Member,Guardian,Representative',
            'claimant_name' => 'required_if:claimant_type,Guardian,Representative|string|max:255',
            'claimant_relationship' => 'required_if:claimant_type,Guardian,Representative|string|max:100',
            'claimant_contact' => 'nullable|string|max:20',
            'claimant_id_type' => 'nullable|string|max:100',
            'claimant_id_number' => 'nullable|string|max:50',
            'authorization_letter' => 'required_if:claimant_type,Representative|nullable|file|mimes:jpeg,jpg,png,pdf|max:5120',
            'claimant_signature' => 'nullable|string', // Base64 encoded signature
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $claim = IDClaim::with('member')->findOrFail($id);

        if ($claim->status === 'claimed') {
            return response()->json([
                'success' => false,
                'message' => 'This claim has already been completed'
            ], 400);
        }

        if ($claim->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot complete a cancelled claim'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $updateData = [
                'status' => 'claimed',
                'claimant_type' => $request->claimant_type,
                'claimant_name' => $request->claimant_type === 'Member' 
                    ? $claim->member->firstName . ' ' . $claim->member->lastName 
                    : $request->claimant_name,
                'claimant_relationship' => $request->claimant_relationship,
                'claimant_contact' => $request->claimant_contact,
                'claimant_id_type' => $request->claimant_id_type,
                'claimant_id_number' => $request->claimant_id_number,
                'claimant_signature' => $request->claimant_signature,
                'claimed_at' => now(),
                'released_by' => $request->user()->userID,
                'released_at' => now(),
                'receipt_number' => IDClaim::generateReceiptNumber(),
                'notes' => $request->notes
            ];

            // Handle authorization letter upload
            if ($request->hasFile('authorization_letter')) {
                $file = $request->file('authorization_letter');
                $path = $file->storeAs(
                    'id-claims/' . date('Y/m/d'),
                    'auth-letter_' . $claim->member_id . '_' . time() . '.' . $file->getClientOriginalExtension(),
                    'public'
                );
                $updateData['authorization_letter_path'] = $path;
            }

            $claim->update($updateData);

            // Update PWD member card status
            $member = $claim->member;
            $issueDate = now();
            $expirationDate = now()->addYears(3);

            $memberUpdate = [
                'cardClaimed' => true,
                'cardIssueDate' => $issueDate,
                'cardExpirationDate' => $expirationDate
            ];

            // If renewal, clear renewal flags
            if ($claim->claim_type === 'renewal') {
                $memberUpdate['renewal_flag'] = false;
                $memberUpdate['flagged_at'] = null;
            }

            $member->update($memberUpdate);

            // Create completion notification
            $this->notifyMember($claim, 'id_claimed',
                'PWD ID Card Claimed Successfully',
                "Your PWD ID card has been successfully claimed. Receipt #: {$updateData['receipt_number']}. Card expires on " . $expirationDate->format('F d, Y') . "."
            );

            // Notify admins about ID claim completion
            try {
                $memberName = trim(($member->firstName ?? '') . ' ' . ($member->lastName ?? ''));
                \App\Services\NotificationService::notifyAdmins(
                    'id_claimed',
                    'ID Claim Completed',
                    "ID claim has been completed for {$memberName} (PWD ID: {$member->pwd_id ?? 'N/A'}). Receipt #: {$updateData['receipt_number']}. Claim ID: {$claim->id}",
                    [
                        'claim_id' => $claim->id,
                        'member_id' => $member->userID,
                        'member_name' => $memberName,
                        'pwd_id' => $member->pwd_id ?? 'N/A',
                        'receipt_number' => $updateData['receipt_number'],
                        'claim_type' => $claim->claim_type,
                        'released_by' => $request->user()->userID,
                        'expiration_date' => $expirationDate->format('Y-m-d'),
                        'timestamp' => now()->toIso8601String()
                    ]
                );
            } catch (\Exception $notifError) {
                \Illuminate\Support\Facades\Log::error('Failed to send admin notification for ID claim completion', [
                    'claim_id' => $claim->id,
                    'error' => $notifError->getMessage()
                ]);
            }

            // Send email confirmation
            $this->sendClaimCompletionEmail($claim, $updateData['receipt_number'], $expirationDate);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Claim completed successfully',
                'claim' => $claim->fresh(['member', 'releaser']),
                'receipt_number' => $updateData['receipt_number']
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete claim',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get claim details
     */
    public function show($id)
    {
        $claim = IDClaim::with(['member', 'processor', 'releaser'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'claim' => $claim
        ]);
    }

    /**
     * Get claim by member
     */
    public function getByMember($memberId)
    {
        $claims = IDClaim::with(['processor', 'releaser'])
            ->where('member_id', $memberId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'claims' => $claims
        ]);
    }

    /**
     * Get today's scheduled pickups
     */
    public function getTodayScheduled()
    {
        $claims = IDClaim::with(['member'])
            ->scheduledToday()
            ->orderBy('scheduled_pickup_time')
            ->get();

        return response()->json([
            'success' => true,
            'claims' => $claims,
            'count' => $claims->count()
        ]);
    }

    /**
     * Cancel a claim
     */
    public function cancel(Request $request, $id)
    {
        $claim = IDClaim::with('member')->findOrFail($id);

        if (!$claim->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'This claim cannot be cancelled'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $claim->update([
                'status' => 'cancelled',
                'notes' => 'Cancelled: ' . $request->reason
            ]);

            $this->notifyMember($claim, 'id_claim_cancelled',
                'ID Claim Cancelled',
                'Your PWD ID claim has been cancelled. Reason: ' . $request->reason
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Claim cancelled successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel claim',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download claim receipt
     */
    public function downloadReceipt($id)
    {
        $claim = IDClaim::with('member')->findOrFail($id);

        if ($claim->status !== 'claimed') {
            return response()->json([
                'success' => false,
                'message' => 'Receipt is only available for completed claims'
            ], 400);
        }

        // Generate PDF receipt (you can enhance this with a proper PDF library)
        $data = [
            'receipt_number' => $claim->receipt_number,
            'member_name' => $claim->member->firstName . ' ' . $claim->member->lastName,
            'pwd_id' => $claim->member->pwd_id,
            'claim_type' => ucfirst($claim->claim_type),
            'claimant_name' => $claim->claimant_name,
            'claimant_type' => $claim->claimant_type,
            'claimed_at' => $claim->claimed_at->format('F d, Y h:i A'),
            'card_expiration' => $claim->member->cardExpirationDate->format('F d, Y')
        ];

        return response()->json([
            'success' => true,
            'receipt_data' => $data
        ]);
    }

    /**
     * Helper: Send notification to member
     */
    private function notifyMember($claim, $type, $title, $message)
    {
        try {
            \App\Services\NotificationService::create(
                $claim->member_id,
                $type,
                $title,
                $message,
                [
                    'claim_id' => $claim->id,
                    'claim_type' => $claim->claim_type
                ]
            );
        } catch (\Exception $e) {
            \Log::warning('Failed to create notification: ' . $e->getMessage());
        }
    }

    /**
     * Helper: Send pickup schedule email
     */
    private function sendPickupScheduleEmail($claim, $pickupDate, $pickupTime)
    {
        try {
            $member = $claim->member;
            $email = $member->email ?? ($member->user->email ?? null);

            if ($email) {
                $emailService = new EmailService();
                // You can create a specific method in EmailService for this
                // For now, we'll use a generic approach
                \Log::info('Pickup schedule email would be sent to: ' . $email);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to send pickup schedule email: ' . $e->getMessage());
        }
    }

    /**
     * Helper: Send claim completion email
     */
    private function sendClaimCompletionEmail($claim, $receiptNumber, $expirationDate)
    {
        try {
            $member = $claim->member;
            $email = $member->email ?? ($member->user->email ?? null);

            if ($email) {
                $emailService = new EmailService();
                // You can create a specific method in EmailService for this
                \Log::info('Claim completion email would be sent to: ' . $email);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to send claim completion email: ' . $e->getMessage());
        }
    }
}

