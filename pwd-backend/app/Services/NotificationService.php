<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Create a notification for a user
     *
     * @param int $userId
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array|null $data
     * @param bool $notifySuperAdmin Whether to also notify SuperAdmin (default: true)
     * @return Notification|null
     */
    public static function create($userId, $type, $title, $message, $data = null, $notifySuperAdmin = true)
    {
        try {
            $notification = Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('Notification created', [
                'notification_id' => $notification->id,
                'user_id' => $userId,
                'type' => $type,
                'title' => $title
            ]);

            // Notify SuperAdmin about all activities (except SuperAdmin's own notifications)
            if ($notifySuperAdmin) {
                $user = User::find($userId);
                if ($user && $user->role !== 'SuperAdmin') {
                    self::notifySuperAdmin($type, $title, $message, $data, $userId);
                }
            }

            return $notification;
        } catch (\Exception $e) {
            Log::error('Failed to create notification', [
                'user_id' => $userId,
                'type' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Send notification for application status change
     *
     * @param int $userId
     * @param string $status
     * @param string $applicantName
     * @param string|null $remarks
     * @return Notification|null
     */
    public static function notifyApplicationStatusChange($userId, $status, $applicantName, $remarks = null)
    {
        $type = 'application_status_change';
        $title = '';
        $message = '';

        switch ($status) {
            case 'Pending Admin Approval':
                $title = 'Application Approved by Barangay';
                $message = "Your application has been approved by the Barangay President and is now pending admin approval.";
                break;
            case 'Approved':
                $title = 'Application Approved - Welcome to PWD Portal!';
                $message = "Congratulations! Your PWD application has been approved. Your account has been created and you can now log in to access your PWD member portal. Your PWD ID card is being processed and will be ready for claiming after 14 business days. You will receive an email and notification when your card is ready for pickup at the PDAO office.";
                break;
            case 'For Claiming':
                $title = 'PWD ID Ready for Claiming';
                $message = "Your PWD ID card is ready for claiming! Please visit the PDAO office during business hours (Monday to Friday, 8:00 AM - 5:00 PM) to claim your card. Don't forget to bring a valid government-issued ID.";
                break;
            case 'Rejected':
                $title = 'Application Rejected';
                $message = "Unfortunately, your application has been rejected. " . ($remarks ? "Reason: {$remarks}" : "Please contact the PDAO office for more information.");
                break;
            default:
                $title = 'Application Status Updated';
                $message = "Your application status has been updated to: {$status}.";
        }

        if ($remarks) {
            $message .= " Remarks: {$remarks}";
        }

        return self::create($userId, $type, $title, $message, [
            'status' => $status,
            'applicant_name' => $applicantName,
            'remarks' => $remarks,
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Send notification for ID claiming
     *
     * @param int $userId
     * @param string $applicantName
     * @param string $pwdId
     * @param string $barangay
     * @return Notification|null
     */
    public static function notifyIdClaiming($userId, $applicantName, $pwdId, $barangay)
    {
        $claimingSchedule = 'Monday to Friday, 8:00 AM - 5:00 PM';
        $instructions = 'Please bring a valid government-issued ID when claiming your PWD ID card at the PDAO office.';
        $officeAddress = 'PDAO Office, Cabuyao City Hall';

        $title = '📧 Email Sent - PWD ID Ready for Claiming';
        $message = "Dear {$applicantName}, an email has been sent to your registered email address with instructions for claiming your PWD ID card (ID: {$pwdId}). ";
        $message .= "Please check your email for detailed claiming instructions. ";
        $message .= "Claiming Schedule: {$claimingSchedule}. ";
        $message .= "Office Address: {$officeAddress}. ";
        $message .= "Required: {$instructions}";

        return self::create($userId, 'id_claiming', $title, $message, [
            'applicant_name' => $applicantName,
            'pwd_id' => $pwdId,
            'barangay' => $barangay,
            'claiming_schedule' => $claimingSchedule,
            'instructions' => $instructions,
            'office_address' => $officeAddress,
            'email_sent' => true,
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Send notification to multiple users
     *
     * @param array $userIds
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array|null $data
     * @param bool $notifySuperAdmin Whether to also notify SuperAdmin (default: true)
     * @return int Number of notifications created
     */
    public static function createMultiple($userIds, $type, $title, $message, $data = null, $notifySuperAdmin = true)
    {
        $count = 0;
        $hasSuperAdmin = false;
        
        // Check if any of the target users is SuperAdmin
        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user && $user->role === 'SuperAdmin') {
                $hasSuperAdmin = true;
                break;
            }
        }
        
        foreach ($userIds as $userId) {
            // Don't notify SuperAdmin again if they're already in the list
            $shouldNotifySuperAdmin = $notifySuperAdmin && !$hasSuperAdmin;
            
            if (self::create($userId, $type, $title, $message, $data, $shouldNotifySuperAdmin)) {
                $count++;
            }
        }
        
        // If SuperAdmin is not in the list, notify them separately
        if ($notifySuperAdmin && !$hasSuperAdmin && !empty($userIds)) {
            // Use the first user ID as the original user for context
            self::notifySuperAdmin($type, $title, $message, $data, $userIds[0]);
        }
        
        return $count;
    }

    /**
     * Send notification to all admins
     *
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array|null $data
     * @return int Number of notifications created
     */
    public static function notifyAdmins($type, $title, $message, $data = null)
    {
        try {
            $adminIds = User::whereIn('role', ['Admin', 'SuperAdmin'])
                ->pluck('userID')
                ->toArray();

            Log::info('Notifying admins', [
                'type' => $type,
                'title' => $title,
                'admin_count' => count($adminIds),
                'admin_ids' => $adminIds,
                'admin_details' => User::whereIn('role', ['Admin', 'SuperAdmin'])
                    ->get(['userID', 'username', 'email', 'role'])
                    ->toArray()
            ]);

            // Create notifications for admins (don't notify SuperAdmin again to avoid duplicates)
            $result = self::createMultiple($adminIds, $type, $title, $message, $data, false);

            Log::info('Admin notifications created', [
                'type' => $type,
                'notifications_created' => $result,
                'expected_count' => count($adminIds)
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Error in notifyAdmins', [
                'type' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 0;
        }
    }

    /**
     * Send notification to SuperAdmin about all activities
     *
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array|null $data
     * @param int|null $originalUserId The user ID who originally received this notification
     * @return int Number of notifications created
     */
    public static function notifySuperAdmin($type, $title, $message, $data = null, $originalUserId = null)
    {
        try {
            $superAdminIds = User::where('role', 'SuperAdmin')
                ->pluck('userID')
                ->toArray();

            if (empty($superAdminIds)) {
                return 0;
            }

            // Enhance message to include user context if available
            $enhancedMessage = $message;
            if ($originalUserId) {
                $originalUser = User::find($originalUserId);
                if ($originalUser) {
                    $userRole = $originalUser->role;
                    $userName = trim(($originalUser->firstName ?? '') . ' ' . ($originalUser->lastName ?? '')) ?: $originalUser->username;
                    $enhancedMessage = "[{$userRole}: {$userName}] " . $message;
                }
            }

            // Enhance data with original user info
            $enhancedData = $data ?? [];
            if ($originalUserId) {
                $enhancedData['original_user_id'] = $originalUserId;
                $originalUser = User::find($originalUserId);
                if ($originalUser) {
                    $enhancedData['original_user_role'] = $originalUser->role;
                    $enhancedData['original_user_name'] = trim(($originalUser->firstName ?? '') . ' ' . ($originalUser->lastName ?? '')) ?: $originalUser->username;
                }
            }

            $result = self::createMultiple($superAdminIds, $type, $title, $enhancedMessage, $enhancedData, false);

            Log::info('SuperAdmin notifications created', [
                'type' => $type,
                'title' => $title,
                'notifications_created' => $result,
                'original_user_id' => $originalUserId
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Error in notifySuperAdmin', [
                'type' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 0;
        }
    }

    /**
     * Send welcome notification to newly approved PWD member with card processing info
     *
     * @param int $userId
     * @param string $memberName
     * @param string $pwdId
     * @param string|null $barangay
     * @return Notification|null
     */
    public static function notifyNewMemberWelcome($userId, $memberName, $pwdId, $barangay = null)
    {
        $title = '🎉 Welcome to PWD Cabuyao!';
        
        $message = "Dear {$memberName},\n\n";
        $message .= "Welcome to the PWD Cabuyao community! Your registration has been successfully processed.\n\n";
        $message .= "📋 YOUR PWD ID: {$pwdId}\n\n";
        $message .= "📅 CARD PROCESSING:\n";
        $message .= "Your PWD ID card is now being prepared and will be ready for claiming after 14 business days from approval.\n\n";
        $message .= "📍 CLAIMING INSTRUCTIONS:\n";
        $message .= "• Location: PDAO Office, Cabuyao City Hall\n";
        $message .= "• Office Hours: Monday to Friday, 8:00 AM - 5:00 PM\n";
        $message .= "• Required: Bring a valid government-issued ID\n\n";
        $message .= "You will receive an email and notification when your card is ready for pickup (14 business days after approval).\n\n";
        $message .= "Thank you for registering with us!";

        // Calculate estimated ready date (14 business days)
        $estimatedReadyDate = self::calculateBusinessDays(14);

        return self::create($userId, 'member_welcome', $title, $message, [
            'member_name' => $memberName,
            'pwd_id' => $pwdId,
            'barangay' => $barangay,
            'processing_days' => '14 business days',
            'estimated_ready_date' => $estimatedReadyDate->format('Y-m-d'),
            'claiming_location' => 'PDAO Office, Cabuyao City Hall',
            'office_hours' => 'Monday to Friday, 8:00 AM - 5:00 PM',
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Send notification when PWD card is ready for pickup
     *
     * @param int $userId
     * @param string $memberName
     * @param string $pwdId
     * @return Notification|null
     */
    public static function notifyCardReadyForPickup($userId, $memberName, $pwdId)
    {
        $title = '✅ Your PWD ID Card is Ready!';
        
        $message = "Dear {$memberName},\n\n";
        $message .= "Great news! Your PWD ID card is now ready for claiming.\n\n";
        $message .= "📋 PWD ID: {$pwdId}\n\n";
        $message .= "📍 WHERE TO CLAIM:\n";
        $message .= "PDAO Office, Cabuyao City Hall\n\n";
        $message .= "🕐 OFFICE HOURS:\n";
        $message .= "Monday to Friday, 8:00 AM - 5:00 PM\n\n";
        $message .= "📝 WHAT TO BRING:\n";
        $message .= "• Valid government-issued ID\n";
        $message .= "• Authorization letter (if claiming through a representative)\n\n";
        $message .= "Please claim your card at your earliest convenience.";

        return self::create($userId, 'card_ready_for_pickup', $title, $message, [
            'member_name' => $memberName,
            'pwd_id' => $pwdId,
            'claiming_location' => 'PDAO Office, Cabuyao City Hall',
            'office_hours' => 'Monday to Friday, 8:00 AM - 5:00 PM',
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Calculate a date that is X business days from now (excluding weekends and holidays)
     *
     * @param int $businessDays
     * @return \Carbon\Carbon
     */
    private static function calculateBusinessDays($businessDays)
    {
        return \App\Services\HolidayService::addBusinessDays(\Carbon\Carbon::today(), $businessDays);
    }
}

