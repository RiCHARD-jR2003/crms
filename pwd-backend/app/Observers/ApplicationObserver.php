<?php

namespace App\Observers;

use App\Models\Application;
use App\Models\PWDMember;
use App\Models\User;
use App\Services\EmailService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class ApplicationObserver
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Handle the Application "updated" event.
     *
     * @param  \App\Models\Application  $application
     * @return void
     */
    public function updated(Application $application)
    {
        // Check if status changed
        if ($application->isDirty('status')) {
            $oldStatus = $application->getOriginal('status');
            $newStatus = $application->status;

            // Handle status change notifications
            $this->handleStatusChange($application, $oldStatus, $newStatus);

            // Special handling for "For Claiming" status
            if ($newStatus === 'For Claiming') {
                $this->handleForClaimingStatus($application);
            }
        }
    }

    /**
     * Handle application status change notifications
     *
     * @param Application $application
     * @param string $oldStatus
     * @param string $newStatus
     * @return void
     */
    protected function handleStatusChange(Application $application, $oldStatus, $newStatus)
    {
        try {
            // Find the user associated with this application
            $user = User::where('email', $application->email)->first();
            
            if (!$user) {
                // If user doesn't exist yet (e.g., pending approval), try to find by pwdID
                if ($application->pwdID) {
                    $user = User::find($application->pwdID);
                }
            }

            if ($user) {
                $applicantName = trim(($application->firstName ?? '') . ' ' . ($application->lastName ?? ''));
                
                // Send notification for status change
                NotificationService::notifyApplicationStatusChange(
                    $user->userID,
                    $newStatus,
                    $applicantName,
                    $application->remarks ?? null
                );

                Log::info('Status change notification sent', [
                    'application_id' => $application->applicationID,
                    'user_id' => $user->userID,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus
                ]);
            } else {
                Log::warning('Could not send status change notification - user not found', [
                    'application_id' => $application->applicationID,
                    'email' => $application->email,
                    'pwd_id' => $application->pwdID
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error sending status change notification', [
                'application_id' => $application->applicationID,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Handle when application status changes to "For Claiming"
     *
     * @param Application $application
     * @return void
     */
    protected function handleForClaimingStatus(Application $application)
    {
        try {
            // Find the PWD member associated with this application
            $member = PWDMember::where('userID', $application->pwdID)->first();

            if (!$member) {
                Log::warning('Application marked For Claiming but member not found', [
                    'application_id' => $application->applicationID,
                    'pwd_id' => $application->pwdID
                ]);
                return;
            }

            // Find the user account
            $user = User::find($application->pwdID);
            if (!$user) {
                Log::warning('User account not found for ID claiming notification', [
                    'application_id' => $application->applicationID,
                    'pwd_id' => $application->pwdID
                ]);
                return;
            }

            $applicantName = trim(($member->firstName ?? $application->firstName ?? '') . ' ' . ($member->lastName ?? $application->lastName ?? ''));
            $pwdId = $member->pwd_id ?? 'N/A';
            $barangay = $member->barangay ?? $application->barangay ?? 'N/A';

            // Send in-app notification
            NotificationService::notifyIdClaiming(
                $user->userID,
                $applicantName,
                $pwdId,
                $barangay
            );

            // Send email notification to applicant
            $emailSent = $this->emailService->sendIDClaimingEmail([
                'firstName' => $member->firstName ?? $application->firstName,
                'lastName' => $member->lastName ?? $application->lastName,
                'email' => $member->email ?? $application->email ?? $user->email,
                'barangay' => $barangay,
                'pwdId' => $pwdId,
                'claimingSchedule' => 'Monday to Friday, 8:00 AM - 5:00 PM',
                'instructions' => 'Please bring a valid government-issued ID when claiming your PWD ID card at the PDAO office.',
                'officeAddress' => 'PDAO Office, Cabuyao City Hall',
                'contactNumber' => $member->contactNumber ?? 'N/A'
            ]);

            if ($emailSent) {
                Log::info('ID claiming email sent', [
                    'application_id' => $application->applicationID,
                    'member_id' => $member->id,
                    'email' => $member->email ?? $application->email ?? $user->email
                ]);
            }

            // Send admin notification (optional)
            $adminEmails = $this->getAdminEmails();
            if (!empty($adminEmails)) {
                $this->emailService->sendIDClaimingAdminNotification([
                    'applicantName' => $applicantName,
                    'barangay' => $barangay,
                    'pwdId' => $pwdId,
                    'adminEmails' => $adminEmails,
                    'flaggedAt' => now()->format('F d, Y h:i A')
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error handling For Claiming status', [
                'application_id' => $application->applicationID,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Get admin email addresses
     *
     * @return array
     */
    protected function getAdminEmails()
    {
        try {
            // Get admin and superadmin users
            $admins = \App\Models\User::whereIn('role', ['Admin', 'SuperAdmin'])
                ->whereNotNull('email')
                ->pluck('email')
                ->toArray();

            return $admins;
        } catch (\Exception $e) {
            Log::warning('Could not fetch admin emails', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}

