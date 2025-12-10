<?php
// app/Http/Controllers/API/PWDMemberController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PWDMember;
use Illuminate\Http\Request;

class PWDMemberController extends Controller
{
    public function index()
    {
        try {
            // Cache for 5 minutes (reduced from 10 to ensure fresh data)
            $cacheKey = 'pwd_members.all';
            $enhancedMembers = \Illuminate\Support\Facades\Cache::remember($cacheKey, now()->addMinutes(5), function () {
                try {
                    // Optimize query: only select needed columns
                    $members = PWDMember::select([
                        'id',
                        'userID',
                        'pwd_id',
                        'pwd_id_generated_at',
                        'firstName',
                        'lastName',
                        'middleName',
                        'suffix',
                        'birthDate',
                        'gender',
                        'disabilityType',
                        'address',
                        'contactNumber',
                        'email',
                        'barangay',
                        'emergencyContact',
                        'emergencyPhone',
                        'emergencyRelationship',
                        'status',
                        'cardClaimed',
                        'cardIssueDate',
                        'cardExpirationDate',
                        'created_at',
                        'updated_at'
                    ])->get();
                } catch (\Exception $e) {
                    // If table doesn't exist or query fails, return empty collection
                    \Illuminate\Support\Facades\Log::warning('PWDMember query failed, returning empty collection', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    $members = collect([]);
                }
            
                // Get all approved applications in one query to avoid N+1
                // Also get applications by email for better matching
                $approvedApplications = collect([]);
                if ($members->isNotEmpty()) {
                    try {
                        $userIDs = $members->pluck('userID')->filter()->toArray();
                        $emails = $members->pluck('email')->filter()->toArray();
                        
                        // Get ALL applications (not just approved) to find contact numbers
                        // This ensures we get contact numbers even if application status changed
                        $allApps = \App\Models\Application::where(function($query) use ($userIDs, $emails) {
                            if (!empty($userIDs)) {
                                $query->whereIn('pwdID', $userIDs);
                            }
                            if (!empty($emails)) {
                                if (!empty($userIDs)) {
                                    $query->orWhereIn('email', $emails);
                                } else {
                                    $query->whereIn('email', $emails);
                                }
                            }
                        })
                        ->select(['applicationID', 'pwdID', 'email', 'contactNumber', 'emergencyContact', 'firstName', 'lastName', 'status'])
                        ->get();
                        
                        // Group by pwdID first (most reliable)
                        $appsByPwdID = collect();
                        if (!empty($userIDs)) {
                            $appsByPwdID = $allApps->whereIn('pwdID', $userIDs)
                                ->groupBy('pwdID')
                                ->map(function ($apps) {
                                    // Prefer approved, but take any if approved not available
                                    $approved = $apps->where('status', 'Approved')->first();
                                    return $approved ?: $apps->first();
                                });
                        }
                        
                        // Group by email for applications without pwdID set or as fallback
                        $appsByEmail = collect();
                        if (!empty($emails)) {
                            $appsByEmail = $allApps->filter(function($app) use ($emails) {
                                return in_array($app->email, $emails);
                            })
                            ->groupBy('email')
                            ->map(function ($apps) {
                                // Prefer approved, but take any if approved not available
                                $approved = $apps->where('status', 'Approved')->first();
                                return $approved ?: $apps->first();
                            });
                        }
                        
                        // Combine both lookups (email lookup will override pwdID if both exist)
                        $approvedApplications = $appsByPwdID->merge($appsByEmail);
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::warning('Failed to fetch approved applications', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }
                
                // Enhance members with data from approved applications if available
                $enhancedMembers = $members->map(function ($member) use ($approvedApplications) {
                    // Try to find application by pwdID first
                    $approvedApplication = $approvedApplications->first(function ($app) use ($member) {
                        return $app->pwdID == $member->userID;
                    });
                    
                    // If not found by pwdID, try by email
                    if (!$approvedApplication && $member->email) {
                        $approvedApplication = $approvedApplications->first(function ($app) use ($member) {
                            return $app->email && strtolower($app->email) === strtolower($member->email);
                        });
                    }
                    
                    // If still not found, try by name matching
                    if (!$approvedApplication) {
                        $approvedApplication = $approvedApplications->first(function ($app) use ($member) {
                            return $app->firstName && $app->lastName && 
                                   strtolower($app->firstName) === strtolower($member->firstName) &&
                                   strtolower($app->lastName) === strtolower($member->lastName);
                        });
                    }
                    
                    if ($approvedApplication) {
                        // Use application data as fallback if member data is missing
                        if (empty($member->contactNumber) && !empty($approvedApplication->contactNumber)) {
                            $member->contactNumber = $approvedApplication->contactNumber;
                        }
                        if (empty($member->emergencyContact) && !empty($approvedApplication->emergencyContact)) {
                            $member->emergencyContact = $approvedApplication->emergencyContact;
                        }
                    }
                    
                    return $member;
                });
                
                return $enhancedMembers; // Return from cache closure
            });
            
            return response()->json([
                'success' => true,
                'data' => $enhancedMembers,
                'count' => $enhancedMembers->count()
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('PWDMemberController::index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            // Return empty result instead of 500 error to prevent frontend crashes
            return response()->json([
                'success' => true,
                'data' => [],
                'count' => 0,
                'message' => 'No PWD members found',
                'warning' => 'Database query failed. Please check backend logs.'
            ], 200);
        }
    }

    public function store(Request $request)
    {
        // This is handled in UserController since PWDMember is created along with User
        return response()->json(['message' => 'Use /api/users endpoint to create PWD members'], 400);
    }

    public function show($id)
    {
        $member = PWDMember::with('user')->find($id);
        
        if (!$member) {
            return response()->json(['message' => 'PWD Member not found'], 404);
        }
        
        return response()->json($member);
    }

    public function update(Request $request, $id)
    {
        // This is handled in UserController since PWDMember is updated along with User
        return response()->json(['message' => 'Use /api/users endpoint to update PWD members'], 400);
    }

    public function destroy($id)
    {
        // This is handled in UserController since PWDMember is deleted along with User
        return response()->json(['message' => 'Use /api/users endpoint to delete PWD members'], 400);
    }

    public function getApplications($id)
    {
        $member = PWDMember::with('applications')->find($id);
        
        if (!$member) {
            return response()->json(['message' => 'PWD Member not found'], 404);
        }
        
        return response()->json($member->applications);
    }

    public function getComplaints($id)
    {
        $member = PWDMember::with('complaints')->find($id);
        
        if (!$member) {
            return response()->json(['message' => 'PWD Member not found'], 404);
        }
        
        return response()->json($member->complaints);
    }

    public function getBenefitClaims($id)
    {
        $member = PWDMember::with('benefitClaims.benefit')->find($id);
        
        if (!$member) {
            return response()->json(['message' => 'PWD Member not found'], 404);
        }
        
        return response()->json($member->benefitClaims);
    }

    /**
     * Calculate business days between two dates (excluding weekends and holidays)
     *
     * @param \Carbon\Carbon $startDate
     * @param \Carbon\Carbon $endDate
     * @return int
     */
    private function calculateBusinessDays($startDate, $endDate)
    {
        return \App\Services\HolidayService::countBusinessDays($startDate, $endDate);
    }

    /**
     * Claim PWD card
     */
    public function claimCard(Request $request, $id)
    {
        try {
            // Try to find member by database id first
            $member = PWDMember::find($id);
            
            // If not found, try by userID (memberId might be userID)
            if (!$member) {
                $member = PWDMember::where('userID', $id)->first();
            }
            
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'PWD Member not found'
                ], 404);
            }

            if ($member->cardClaimed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Card has already been claimed'
                ], 400);
            }

            // Check if 14 business days have passed since approval
            if ($member->approval_date) {
                $approvalDate = \Carbon\Carbon::parse($member->approval_date);
                $today = \Carbon\Carbon::today();
                $businessDaysPassed = $this->calculateBusinessDays($approvalDate, $today);

                if ($businessDaysPassed < 14) {
                    $daysRemaining = 14 - $businessDaysPassed;
                    return response()->json([
                        'success' => false,
                        'message' => "ID card is not yet ready for claiming. Please wait {$daysRemaining} more business day(s). The ID will be ready 14 business days after approval.",
                        'business_days_passed' => $businessDaysPassed,
                        'days_remaining' => $daysRemaining
                    ], 400);
                }
            } else {
                // If no approval_date is set, check if notification was sent (for backward compatibility)
                if (!$member->id_ready_notification_sent_at) {
                    return response()->json([
                        'success' => false,
                        'message' => 'ID card is not yet ready for claiming. You will receive a notification when your ID is ready (14 business days after approval).'
                    ], 400);
                }
            }

            // Set card as claimed
            $issueDate = now()->toDateString(); // Format as Y-m-d for date column
            $expirationDate = now()->addYears(3)->toDateString(); // 3 years validity, format as Y-m-d

            $member->update([
                'cardClaimed' => true,
                'cardIssueDate' => $issueDate,
                'cardExpirationDate' => $expirationDate
            ]);

            // Create notification for the member (wrap in try-catch to prevent failure)
            try {
                // Format expiration date for display
                $expirationDateFormatted = \Carbon\Carbon::parse($expirationDate)->format('F d, Y');
                
                \App\Services\NotificationService::create(
                    $member->userID,
                    'card_claimed',
                    'PWD Card Claimed',
                    'Your PWD ID card has been successfully claimed. Card expires on ' . $expirationDateFormatted . '.',
                    [
                        'member_id' => $member->id,
                        'card_issue_date' => $issueDate,
                        'card_expiration_date' => $expirationDate
                    ]
                );
            } catch (\Exception $notificationError) {
                // Log notification error but don't fail the card claim
                \Illuminate\Support\Facades\Log::warning('Failed to create notification for card claim', [
                    'member_id' => $member->id,
                    'error' => $notificationError->getMessage()
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Card claimed successfully',
                'data' => $member->fresh()
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error claiming PWD card', [
                'member_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to claim card',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Renew PWD card
     */
    public function renewCard(Request $request, $id)
    {
        try {
            $member = PWDMember::find($id);
            
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'PWD Member not found'
                ], 404);
            }

            if (!$member->cardClaimed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Card must be claimed before it can be renewed'
                ], 400);
            }

            // Renew card - set new expiration date (3 years from now)
            $newExpirationDate = now()->addYears(3);
            $member->update([
                'cardExpirationDate' => $newExpirationDate,
                'cardIssueDate' => now() // Update issue date to renewal date
            ]);

            // Create notification for the member
            \App\Services\NotificationService::create(
                $member->userID,
                'card_renewed',
                'PWD Card Renewed',
                'Your PWD ID card has been successfully renewed. New expiration date: ' . $newExpirationDate->format('F d, Y') . '.',
                [
                    'member_id' => $member->id,
                    'card_renewal_date' => now()->toDateString(),
                    'card_expiration_date' => $newExpirationDate->toDateString()
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Card renewed successfully',
                'data' => $member->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to renew card',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}