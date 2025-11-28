<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Application;
use App\Models\PendingRegistrationPolicySetting;
use App\Services\EmailService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessPendingApplications extends Command
{
    protected $signature = 'applications:process-pending';
    protected $description = 'Process pending applications for expiry/rejection based on holding duration';

    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        parent::__construct();
        $this->emailService = $emailService;
    }

    public function handle()
    {
        $this->info('Starting pending applications processing...');

        // Check if policy is enabled
        $policyEnabled = PendingRegistrationPolicySetting::getValue('enable_pending_policy', 'true') === 'true';
        if (!$policyEnabled) {
            $this->info('Pending registration policy is disabled. Skipping processing.');
            return Command::SUCCESS;
        }

        $expiryAction = PendingRegistrationPolicySetting::getValue('expiry_action', 'expire');
        $holdingDurationHours = (int) PendingRegistrationPolicySetting::getValue('holding_duration_hours', 72);
        $reminderHours = (int) PendingRegistrationPolicySetting::getValue('reminder_hours_before_expiry', 24);

        $this->info("Policy settings: Duration={$holdingDurationHours}h, Action={$expiryAction}, Reminder={$reminderHours}h before");

        // Get pending applications
        $pendingApplications = Application::whereIn('status', [
            'Pending',
            'Pending Barangay Approval',
            'Pending Admin Approval'
        ])->get();

        $this->info("Found {$pendingApplications->count()} pending applications");

        $expiredCount = 0;
        $rejectedCount = 0;
        $reminderSentCount = 0;
        $errors = [];

        foreach ($pendingApplications as $application) {
            try {
                DB::beginTransaction();

                // Calculate expiry if not set
                if (!$application->expires_at) {
                    $application->calculateExpiryDate();
                    $application->save();
                }

                // Check if expired
                if ($application->isExpired() && $application->status !== 'Expired' && $application->status !== 'Rejected') {
                    $previousStatus = $application->status;
                    
                    if ($expiryAction === 'reject') {
                        $application->status = 'Rejected';
                        $application->remarks = ($application->remarks ? $application->remarks . "\n\n" : '') . 
                            "Auto-rejected due to pending duration expiry. Reference: {$application->referenceNumber}";
                        $application->save();

                        // Send rejection email
                        $this->emailService->sendApplicationExpiryRejectionEmail([
                            'email' => $application->email,
                            'firstName' => $application->firstName,
                            'lastName' => $application->lastName,
                            'referenceNumber' => $application->referenceNumber,
                            'submissionDate' => $application->submissionDate,
                            'expiryDate' => $application->expires_at,
                        ]);

                        // Log audit
                        $this->logAudit($application, $previousStatus, 'Rejected', 'Auto-rejected by system due to expiry');

                        $rejectedCount++;
                        $this->info("  ✓ Auto-rejected: {$application->referenceNumber}");
                    } else {
                        $application->status = 'Expired';
                        $application->remarks = ($application->remarks ? $application->remarks . "\n\n" : '') . 
                            "Expired due to pending duration expiry. Reference: {$application->referenceNumber}";
                        $application->save();

                        // Send expiry email
                        $this->emailService->sendApplicationExpiryEmail([
                            'email' => $application->email,
                            'firstName' => $application->firstName,
                            'lastName' => $application->lastName,
                            'referenceNumber' => $application->referenceNumber,
                            'submissionDate' => $application->submissionDate,
                            'expiryDate' => $application->expires_at,
                        ]);

                        // Log audit
                        $this->logAudit($application, $previousStatus, 'Expired', 'Auto-expired by system');

                        $expiredCount++;
                        $this->info("  ✓ Auto-expired: {$application->referenceNumber}");
                    }

                    // Send admin notification
                    $this->sendAdminNotification($application, $expiryAction === 'reject' ? 'Rejected' : 'Expired');

                } elseif ($application->shouldSendReminder()) {
                    // Send reminder email
                    $this->emailService->sendApplicationExpiryReminderEmail([
                        'email' => $application->email,
                        'firstName' => $application->firstName,
                        'lastName' => $application->lastName,
                        'referenceNumber' => $application->referenceNumber,
                        'expiresAt' => $application->expires_at,
                        'remainingHours' => now()->diffInHours($application->expires_at),
                    ]);

                    $application->reminder_sent = true;
                    $application->save();

                    // Log audit
                    $this->logAudit($application, $application->status, $application->status, 'Reminder email sent');

                    $reminderSentCount++;
                    $this->info("  ✓ Reminder sent: {$application->referenceNumber}");
                }

                DB::commit();

            } catch (\Exception $e) {
                DB::rollBack();
                $errorMsg = "Error processing application {$application->referenceNumber}: {$e->getMessage()}";
                $errors[] = $errorMsg;
                $this->error("  ✗ {$errorMsg}");
                Log::error('ProcessPendingApplications error', [
                    'application_id' => $application->applicationID,
                    'reference_number' => $application->referenceNumber,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        // Summary
        $this->info("\n=== Processing Summary ===");
        $this->info("Expired: {$expiredCount}");
        $this->info("Rejected: {$rejectedCount}");
        $this->info("Reminders sent: {$reminderSentCount}");
        $this->info("Errors: " . count($errors));

        if (count($errors) > 0) {
            $this->warn("\nErrors encountered:");
            foreach ($errors as $error) {
                $this->warn("  - {$error}");
            }
        }

        return Command::SUCCESS;
    }

    protected function logAudit($application, $previousStatus, $newStatus, $action)
    {
        try {
            DB::table('audit_log')->insert([
                'user_id' => null,
                'action' => 'system.auto',
                'model' => 'Application',
                'model_id' => $application->applicationID,
                'description' => "Application {$action}: {$previousStatus} → {$newStatus}",
                'old_values' => json_encode(['status' => $previousStatus]),
                'new_values' => json_encode([
                    'status' => $newStatus,
                    'reference_number' => $application->referenceNumber,
                    'expires_at' => $application->expires_at?->toDateTimeString(),
                ]),
                'reference_number' => $application->referenceNumber,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'System Cron Job',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to log audit for pending application processing', [
                'error' => $e->getMessage(),
                'application_id' => $application->applicationID
            ]);
        }
    }

    protected function sendAdminNotification($application, $action)
    {
        try {
            // Get admin emails
            $adminEmails = DB::table('users')
                ->whereIn('role', ['Admin', 'SuperAdmin'])
                ->pluck('email')
                ->toArray();

            if (empty($adminEmails)) {
                return;
            }

            $this->emailService->sendApplicationExpiryAdminNotification([
                'emails' => $adminEmails,
                'application' => [
                    'referenceNumber' => $application->referenceNumber,
                    'firstName' => $application->firstName,
                    'lastName' => $application->lastName,
                    'barangay' => $application->barangay,
                    'email' => $application->email,
                    'submissionDate' => $application->submissionDate,
                    'expiryDate' => $application->expires_at,
                    'previousStatus' => $application->getOriginal('status'),
                    'newStatus' => $application->status,
                    'action' => $action,
                ],
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to send admin notification', [
                'error' => $e->getMessage(),
                'application_id' => $application->applicationID
            ]);
        }
    }
}

