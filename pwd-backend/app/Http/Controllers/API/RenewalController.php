<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PWDMember;
use App\Models\RenewalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class RenewalController extends Controller
{
    /**
     * Get all members flagged for renewal
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRenewalMembers(Request $request)
    {
        try {
            $query = PWDMember::flaggedForRenewal()
                ->where('cardClaimed', true)
                ->whereNotNull('cardExpirationDate');

            // Sorting
            $sortBy = $request->get('sort_by', 'flagged_at'); // latest_flagged, soonest_expire
            $sortOrder = $request->get('sort_order', 'desc');

            switch ($sortBy) {
                case 'soonest_expire':
                    $query->orderBy('cardExpirationDate', $sortOrder);
                    break;
                case 'latest_flagged':
                default:
                    $query->orderBy('flagged_at', $sortOrder);
                    break;
            }

            // Filter by barangay
            if ($request->has('barangay') && $request->barangay) {
                $query->where('barangay', $request->barangay);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $members = $query->paginate($perPage);

            // Format response
            $formattedMembers = $members->map(function ($member) {
                $daysRemaining = $member->cardExpirationDate 
                    ? Carbon::parse($member->cardExpirationDate)->diffInDays(Carbon::today(), false)
                    : null;

                return [
                    'id' => $member->id,
                    'userID' => $member->userID,
                    'pwd_id' => $member->pwd_id,
                    'firstName' => $member->firstName,
                    'lastName' => $member->lastName,
                    'middleName' => $member->middleName,
                    'fullName' => trim(($member->firstName ?? '') . ' ' . ($member->lastName ?? '')),
                    'barangay' => $member->barangay,
                    'email' => $member->email,
                    'contactNumber' => $member->contactNumber,
                    'cardExpirationDate' => $member->cardExpirationDate,
                    'daysRemaining' => $daysRemaining,
                    'flagged_at' => $member->flagged_at,
                    'renewal_reminder_sent_at' => $member->renewal_reminder_sent_at,
                    'reminder_sent' => !is_null($member->renewal_reminder_sent_at)
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedMembers,
                'pagination' => [
                    'current_page' => $members->currentPage(),
                    'last_page' => $members->lastPage(),
                    'per_page' => $members->perPage(),
                    'total' => $members->total()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching renewal members', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch renewal members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get renewal statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRenewalStats()
    {
        try {
            $totalFlagged = PWDMember::flaggedForRenewal()->count();
            $expiringThisWeek = PWDMember::flaggedForRenewal()
                ->whereNotNull('cardExpirationDate')
                ->whereBetween('cardExpirationDate', [
                    Carbon::today(),
                    Carbon::today()->addWeek()
                ])
                ->count();
            $expiringThisMonth = PWDMember::flaggedForRenewal()
                ->whereNotNull('cardExpirationDate')
                ->whereBetween('cardExpirationDate', [
                    Carbon::today(),
                    Carbon::today()->addMonth()
                ])
                ->count();
            $remindersSent = PWDMember::flaggedForRenewal()
                ->whereNotNull('renewal_reminder_sent_at')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_flagged' => $totalFlagged,
                    'expiring_this_week' => $expiringThisWeek,
                    'expiring_this_month' => $expiringThisMonth,
                    'reminders_sent' => $remindersSent
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching renewal stats', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch renewal statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get renewal settings
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRenewalSettings()
    {
        try {
            $settings = RenewalSetting::getAllSettings();

            return response()->json([
                'success' => true,
                'data' => [
                    'renewal_days_before_expiry' => (int) ($settings['renewal_days_before_expiry'] ?? 30),
                    'renewal_reminder_interval_days' => (int) ($settings['renewal_reminder_interval_days'] ?? 7)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching renewal settings', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch renewal settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update renewal settings
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateRenewalSettings(Request $request)
    {
        try {
            $request->validate([
                'renewal_days_before_expiry' => 'sometimes|integer|min:1|max:365',
                'renewal_reminder_interval_days' => 'sometimes|integer|min:1|max:30'
            ]);

            $updated = [];

            if ($request->has('renewal_days_before_expiry')) {
                RenewalSetting::setValue('renewal_days_before_expiry', $request->renewal_days_before_expiry);
                $updated[] = 'renewal_days_before_expiry';
            }

            if ($request->has('renewal_reminder_interval_days')) {
                RenewalSetting::setValue('renewal_reminder_interval_days', $request->renewal_reminder_interval_days);
                $updated[] = 'renewal_reminder_interval_days';
            }

            return response()->json([
                'success' => true,
                'message' => 'Renewal settings updated successfully',
                'updated' => $updated
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating renewal settings', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update renewal settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

