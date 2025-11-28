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
     * @return Notification|null
     */
    public static function create($userId, $type, $title, $message, $data = null)
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
                $title = 'Application Approved';
                $message = "Congratulations! Your PWD application has been approved. Your account has been created and you can now log in to access your PWD member portal.";
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

        $title = 'PWD ID Ready for Claiming';
        $message = "Dear {$applicantName}, your PWD ID card (ID: {$pwdId}) is ready for claiming. ";
        $message .= "Claiming Schedule: {$claimingSchedule}. ";
        $message .= "Instructions: {$instructions} ";
        $message .= "Office Address: {$officeAddress}.";

        return self::create($userId, 'id_claiming', $title, $message, [
            'applicant_name' => $applicantName,
            'pwd_id' => $pwdId,
            'barangay' => $barangay,
            'claiming_schedule' => $claimingSchedule,
            'instructions' => $instructions,
            'office_address' => $officeAddress,
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
     * @return int Number of notifications created
     */
    public static function createMultiple($userIds, $type, $title, $message, $data = null)
    {
        $count = 0;
        foreach ($userIds as $userId) {
            if (self::create($userId, $type, $title, $message, $data)) {
                $count++;
            }
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
        $adminIds = User::whereIn('role', ['Admin', 'SuperAdmin'])
            ->pluck('userID')
            ->toArray();

        return self::createMultiple($adminIds, $type, $title, $message, $data);
    }
}

