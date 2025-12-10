<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\IDRenewal;
use App\Models\PWDMember;
use App\Models\Notification;
use App\Services\EmailService;
use Carbon\Carbon;

class IDRenewalController extends Controller
{
    /**
     * Submit a renewal request
     * Member must upload old ID card image and medical certificate
     */
    public function submitRenewal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'old_card_image' => 'required|file|mimes:jpeg,jpg,png,pdf|max:5120', // 5MB max
            'medical_certificate' => 'required|file|mimes:jpeg,jpg,png,pdf|max:5120' // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $memberId = $request->user()->userID;
        $member = PWDMember::where('userID', $memberId)->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'PWD Member not found'
            ], 404);
        }

        // Check if member has a claimed card
        if (!$member->cardClaimed) {
            return response()->json([
                'success' => false,
                'message' => 'You must have a claimed PWD ID card before renewing'
            ], 400);
        }

        // Check if there's already a pending renewal request
        $existingRenewal = IDRenewal::where('member_id', $memberId)
            ->where('status', 'pending')
            ->first();

        if ($existingRenewal) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending renewal request. Please wait for it to be reviewed.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Store old card image
            $oldCardFile = $request->file('old_card_image');
            $oldCardPath = 'id-renewals/' . date('Y/m/d') . '/old-card_' . $memberId . '_' . time() . '.' . $oldCardFile->getClientOriginalExtension();
            $oldCardPath = $oldCardFile->storeAs('id-renewals/' . date('Y/m/d'), 'old-card_' . $memberId . '_' . time() . '.' . $oldCardFile->getClientOriginalExtension(), 'public');

            // Store medical certificate
            $medicalCertFile = $request->file('medical_certificate');
            $medicalCertPath = $medicalCertFile->storeAs('id-renewals/' . date('Y/m/d'), 'medical-cert_' . $memberId . '_' . time() . '.' . $medicalCertFile->getClientOriginalExtension(), 'public');

            // Create renewal request
            $renewal = IDRenewal::create([
                'member_id' => $memberId,
                'old_card_image_path' => $oldCardPath,
                'medical_certificate_path' => $medicalCertPath,
                'status' => 'pending',
                'submitted_at' => now()
            ]);

            // Notify the member
            \App\Services\NotificationService::create(
                $memberId,
                'renewal_submitted',
                'Renewal Request Submitted',
                'Your ID renewal request has been submitted successfully. Please wait for admin review.',
                [
                    'renewal_id' => $renewal->id,
                    'submitted_at' => $renewal->submitted_at
                ]
            );

            // Notify admins about new renewal request
            try {
                $memberName = trim(($member->firstName ?? '') . ' ' . ($member->lastName ?? ''));
                $pwdId = $member->pwd_id ?? 'N/A';
                \App\Services\NotificationService::notifyAdmins(
                    'id_renewal',
                    'New ID Renewal Request',
                    "A new ID renewal request has been submitted by {$memberName} (PWD ID: {$pwdId}). Renewal ID: {$renewal->id}",
                    [
                        'renewal_id' => $renewal->id,
                        'member_id' => $memberId,
                        'member_name' => $memberName,
                        'pwd_id' => $pwdId,
                        'submitted_at' => now()->toIso8601String()
                    ]
                );
            } catch (\Exception $notifError) {
                \Illuminate\Support\Facades\Log::error('Failed to send admin notification for renewal', [
                    'renewal_id' => $renewal->id,
                    'error' => $notifError->getMessage()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Renewal request submitted successfully',
                'renewal' => $renewal->load('member')
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit renewal request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get renewal status for the authenticated member
     */
    public function getMyRenewalStatus(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            $memberId = $user->userID;

            // Get renewal without eager loading relationships that might not exist
            $renewal = IDRenewal::where('member_id', $memberId)
                ->orderBy('submitted_at', 'desc')
                ->first();

            $member = PWDMember::where('userID', $memberId)->first();

            if (!$member) {
                return response()->json([
                    'success' => true,
                    'renewal' => null,
                    'card_info' => [
                        'card_claimed' => false,
                        'card_issue_date' => null,
                        'card_expiration_date' => null,
                        'days_until_expiration' => null,
                        'is_expiring_soon' => false
                    ]
                ]);
            }

            // Handle dates - they're already Carbon instances due to model casting
            $cardIssueDate = null;
            $cardExpirationDate = null;
            $daysUntilExpiration = null;
            $isExpiringSoon = false;

            if ($member->cardIssueDate) {
                try {
                    // If it's already a Carbon instance, use it directly; otherwise parse it
                    $cardIssueDate = $member->cardIssueDate instanceof Carbon 
                        ? $member->cardIssueDate->format('Y-m-d')
                        : Carbon::parse($member->cardIssueDate)->format('Y-m-d');
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Error parsing cardIssueDate', [
                        'member_id' => $memberId,
                        'cardIssueDate' => $member->cardIssueDate,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            if ($member->cardExpirationDate) {
                try {
                    // If it's already a Carbon instance, use it directly; otherwise parse it
                    $expirationDate = $member->cardExpirationDate instanceof Carbon 
                        ? $member->cardExpirationDate
                        : Carbon::parse($member->cardExpirationDate);
                    
                    $cardExpirationDate = $expirationDate->format('Y-m-d');
                    $daysUntilExpiration = $expirationDate->diffInDays(Carbon::today(), false);
                    $isExpiringSoon = $daysUntilExpiration <= 30;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Error parsing cardExpirationDate', [
                        'member_id' => $memberId,
                        'cardExpirationDate' => $member->cardExpirationDate,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'renewal' => $renewal,
                'card_info' => [
                    'card_claimed' => $member->cardClaimed ?? false,
                    'card_issue_date' => $cardIssueDate,
                    'card_expiration_date' => $cardExpirationDate,
                    'days_until_expiration' => $daysUntilExpiration,
                    'is_expiring_soon' => $isExpiringSoon
                ]
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching renewal status', [
                'user_id' => $request->user()?->userID,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch renewal status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all renewal requests (Admin only)
     */
    public function getAllRenewals(Request $request)
    {
        $status = $request->query('status', 'all'); // all, pending, approved, rejected

        $query = IDRenewal::with(['member', 'reviewer']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $renewals = $query->orderBy('submitted_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'renewals' => $renewals,
            'counts' => [
                'total' => IDRenewal::count(),
                'pending' => IDRenewal::where('status', 'pending')->count(),
                'approved' => IDRenewal::where('status', 'approved')->count(),
                'rejected' => IDRenewal::where('status', 'rejected')->count()
            ]
        ]);
    }

    /**
     * Get a specific renewal request (Admin)
     */
    public function getRenewal($id)
    {
        $renewal = IDRenewal::with(['member', 'reviewer'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'renewal' => $renewal
        ]);
    }

    /**
     * Approve a renewal request (Admin)
     */
    public function approveRenewal(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $renewal = IDRenewal::with(['member', 'member.user'])->findOrFail($id);

        if ($renewal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This renewal request has already been processed'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $member = $renewal->member;
            $adminId = $request->user()->userID;

            // Update renewal status
            $renewal->update([
                'status' => 'approved',
                'reviewed_by' => $adminId,
                'reviewed_at' => now(),
                'notes' => $request->notes
            ]);

            // Renew the card - set new expiration date (3 years from now)
            $newExpirationDate = now()->addYears(3);
            $member->update([
                'cardExpirationDate' => $newExpirationDate,
                'cardIssueDate' => now() // Update issue date to renewal date
            ]);

            // Notify the member
            \App\Services\NotificationService::create(
                $member->userID,
                'renewal_approved',
                'ID Renewal Approved',
                'Your ID renewal request has been approved. Your new card expiration date is ' . $newExpirationDate->format('F d, Y') . '.',
                [
                    'renewal_id' => $renewal->id,
                    'new_expiration_date' => $newExpirationDate->toDateString()
                ]
            );

            // Notify other admins about renewal approval
            try {
                $memberName = trim(($member->firstName ?? '') . ' ' . ($member->lastName ?? ''));
                $reviewerName = $request->user()->username ?? 'Admin';
                
                // Only notify other admins (not the one who approved)
                $adminIds = \App\Models\User::whereIn('role', ['Admin', 'SuperAdmin'])
                    ->where('userID', '!=', $adminId)
                    ->pluck('userID')
                    ->toArray();
                
                if (!empty($adminIds)) {
                    \App\Services\NotificationService::createMultiple(
                        $adminIds,
                        'id_renewal',
                        'ID Renewal Approved',
                        "ID renewal request for {$memberName} (PWD ID: " . ($member->pwd_id ?? 'N/A') . ") has been approved by {$reviewerName}. New expiration date: " . $newExpirationDate->format('F d, Y'),
                        [
                            'renewal_id' => $renewal->id,
                            'member_id' => $member->userID,
                            'member_name' => $memberName,
                            'pwd_id' => $member->pwd_id ?? 'N/A',
                            'new_expiration_date' => $newExpirationDate->toDateString(),
                            'reviewed_by' => $adminId,
                            'reviewer_name' => $reviewerName,
                            'timestamp' => now()->toIso8601String()
                        ]
                    );
                }
            } catch (\Exception $notifError) {
                \Illuminate\Support\Facades\Log::error('Failed to send admin notification for renewal approval', [
                    'renewal_id' => $renewal->id,
                    'error' => $notifError->getMessage()
                ]);
            }

            // Send email notification to the member
            try {
                // Get member's email (try from member first, then from user relationship)
                $memberEmail = $member->email;
                if (empty($memberEmail) && $member->user) {
                    $memberEmail = $member->user->email;
                }

                if (!empty($memberEmail)) {
                    $emailService = new EmailService();
                    $emailService->sendRenewalApprovalEmail([
                        'email' => $memberEmail,
                        'firstName' => $member->firstName,
                        'lastName' => $member->lastName,
                        'pwdId' => $member->pwd_id ?? 'N/A',
                        'newExpirationDate' => $newExpirationDate->format('F d, Y'),
                        'renewalDate' => now()->format('F d, Y'),
                        'notes' => $request->notes ?? ''
                    ]);
                }
            } catch (\Exception $emailException) {
                // Log email error but don't fail the approval
                \Illuminate\Support\Facades\Log::warning('Failed to send renewal approval email', [
                    'member_id' => $member->id,
                    'error' => $emailException->getMessage()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Renewal approved successfully',
                'renewal' => $renewal->fresh(['member', 'reviewer'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve renewal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a renewal request (Admin)
     */
    public function rejectRenewal(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $renewal = IDRenewal::with('member')->findOrFail($id);

        if ($renewal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This renewal request has already been processed'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $adminId = $request->user()->userID;

            // Update renewal status
            $renewal->update([
                'status' => 'rejected',
                'reviewed_by' => $adminId,
                'reviewed_at' => now(),
                'notes' => $request->notes
            ]);

            // Notify the member
            \App\Services\NotificationService::create(
                $renewal->member->userID,
                'renewal_rejected',
                'ID Renewal Rejected',
                'Your ID renewal request has been rejected. Reason: ' . $request->notes . '. Please review the requirements and submit a new request.',
                [
                    'renewal_id' => $renewal->id,
                    'rejection_reason' => $request->notes
                ]
            );

            // Notify other admins about renewal rejection
            try {
                $member = $renewal->member;
                $memberName = trim(($member->firstName ?? '') . ' ' . ($member->lastName ?? ''));
                $reviewerName = $request->user()->username ?? 'Admin';
                
                // Only notify other admins (not the one who rejected)
                $adminIds = \App\Models\User::whereIn('role', ['Admin', 'SuperAdmin'])
                    ->where('userID', '!=', $adminId)
                    ->pluck('userID')
                    ->toArray();
                
                if (!empty($adminIds)) {
                    \App\Services\NotificationService::createMultiple(
                        $adminIds,
                        'id_renewal',
                        'ID Renewal Rejected',
                        "ID renewal request for {$memberName} (PWD ID: " . ($member->pwd_id ?? 'N/A') . ") has been rejected by {$reviewerName}. Reason: {$request->notes}",
                        [
                            'renewal_id' => $renewal->id,
                            'member_id' => $member->userID,
                            'member_name' => $memberName,
                            'pwd_id' => $member->pwd_id ?? 'N/A',
                            'rejection_reason' => $request->notes,
                            'reviewed_by' => $adminId,
                            'reviewer_name' => $reviewerName,
                            'timestamp' => now()->toIso8601String()
                        ]
                    );
                }
            } catch (\Exception $notifError) {
                \Illuminate\Support\Facades\Log::error('Failed to send admin notification for renewal rejection', [
                    'renewal_id' => $renewal->id,
                    'error' => $notifError->getMessage()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Renewal rejected',
                'renewal' => $renewal->fresh(['member', 'reviewer'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject renewal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get file for download (old card image or medical certificate)
     */
    public function getFile($id, $type)
    {
        try {
            $renewal = IDRenewal::findOrFail($id);
            
            // Check if user has permission (admin or the member themselves)
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Allow admins or the member who owns the renewal
            $isAdmin = in_array($user->role, ['Admin', 'SuperAdmin']);
            $isOwner = $renewal->member_id == $user->userID;
            
            if (!$isAdmin && !$isOwner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this file'
                ], 403);
            }
            
            if (!in_array($type, ['old_card', 'medical_certificate'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid file type'
                ], 400);
            }

            $filePath = $type === 'old_card' ? $renewal->old_card_image_path : $renewal->medical_certificate_path;

            if (!$filePath || !Storage::disk('public')->exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }

            // Get full path to file
            $fullPath = Storage::disk('public')->path($filePath);
            
            // Get the origin from the request to set proper CORS header
            $origin = request()->header('Origin');
            $allowedOrigins = config('cors.allowed_origins', []);
            $allowedOrigin = null;
            
            // Check if origin is in allowed list
            if ($origin && in_array($origin, $allowedOrigins)) {
                $allowedOrigin = $origin;
            } elseif ($origin && preg_match('#^https://.*\.trycloudflare\.com$#', $origin)) {
                // Match trycloudflare pattern
                $allowedOrigin = $origin;
            }
            
            // Build response with file
            $response = response()->file($fullPath, [
                'Content-Disposition' => 'inline; filename="' . basename($filePath) . '"'
            ]);
            
            // Add CORS headers if origin is allowed
            if ($allowedOrigin) {
                $response->header('Access-Control-Allow-Origin', $allowedOrigin)
                         ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                         ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
            
            return $response;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error retrieving renewal file', [
                'renewal_id' => $id,
                'file_type' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
