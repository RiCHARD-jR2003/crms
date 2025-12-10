<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PWDMember;
use App\Services\EmailService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotifyIdReadyForClaiming extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pwd:notify-id-ready';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify members whose PWD ID cards are ready for claiming (14 business days after approval)';

    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        parent::__construct();
        $this->emailService = $emailService;
    }

    /**
     * Calculate business days between two dates (excluding weekends and holidays)
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return int
     */
    private function calculateBusinessDays(Carbon $startDate, Carbon $endDate): int
    {
        return \App\Services\HolidayService::countBusinessDays($startDate, $endDate);
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking for members whose IDs are ready for claiming...');

        $today = Carbon::today();
        $businessDaysRequired = 14;

        // Find members who:
        // 1. Have an approval_date set
        // 2. Have not claimed their card yet
        // 3. Have not received the ID ready notification yet
        // 4. Have a PWD ID generated
        $members = PWDMember::whereNotNull('approval_date')
            ->where('cardClaimed', false)
            ->whereNull('id_ready_notification_sent_at')
            ->whereNotNull('pwd_id')
            ->get();

        $notifiedCount = 0;
        $emailSentCount = 0;
        $errors = [];

        foreach ($members as $member) {
            try {
                $approvalDate = Carbon::parse($member->approval_date);
                $businessDaysPassed = $this->calculateBusinessDays($approvalDate, $today);

                // Check if 14 business days have passed
                if ($businessDaysPassed >= $businessDaysRequired) {
                    $this->info("Member {$member->pwd_id} ({$member->firstName} {$member->lastName}) - {$businessDaysPassed} business days passed");

                    // Send email notification
                    $emailSent = $this->emailService->sendIDClaimingEmail([
                        'firstName' => $member->firstName,
                        'lastName' => $member->lastName,
                        'email' => $member->email ?? $member->user->email ?? null,
                        'barangay' => $member->barangay ?? 'N/A',
                        'pwdId' => $member->pwd_id ?? 'N/A',
                        'claimingSchedule' => 'Monday to Friday, 8:00 AM - 5:00 PM',
                        'instructions' => 'Please bring a valid government-issued ID when claiming your PWD ID card at the PDAO office.',
                        'officeAddress' => 'PDAO Office, Cabuyao City Hall',
                        'contactNumber' => $member->contactNumber ?? 'N/A'
                    ]);

                    if ($emailSent) {
                        $emailSentCount++;
                        $this->info("  ✓ Email sent to {$member->email}");

                        // Send in-app notification after email is sent
                        $applicantName = trim(($member->firstName ?? '') . ' ' . ($member->lastName ?? ''));
                        NotificationService::notifyIdClaiming(
                            $member->userID,
                            $applicantName,
                            $member->pwd_id ?? 'N/A',
                            $member->barangay ?? 'N/A'
                        );

                        // Mark notification as sent
                        $member->update([
                            'id_ready_notification_sent_at' => now()
                        ]);

                        $notifiedCount++;
                        $this->info("  ✓ In-app notification created");
                    } else {
                        $errors[] = "Failed to send email to {$member->email} (Member: {$member->pwd_id})";
                        $this->error("  ✗ Failed to send email to {$member->email}");
                    }
                } else {
                    $daysRemaining = $businessDaysRequired - $businessDaysPassed;
                    $this->line("  Member {$member->pwd_id} - {$daysRemaining} business days remaining");
                }
            } catch (\Exception $e) {
                $errors[] = "Error processing member {$member->pwd_id}: " . $e->getMessage();
                $this->error("  ✗ Error: " . $e->getMessage());
                Log::error('Error in NotifyIdReadyForClaiming command', [
                    'member_id' => $member->id,
                    'pwd_id' => $member->pwd_id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        // Log summary
        Log::info('ID ready notification check completed', [
            'total_members_checked' => $members->count(),
            'notified_count' => $notifiedCount,
            'email_sent_count' => $emailSentCount,
            'errors_count' => count($errors)
        ]);

        $this->info("\nSummary:");
        $this->info("  - Members checked: {$members->count()}");
        $this->info("  - Notifications sent: {$notifiedCount}");
        $this->info("  - Emails sent: {$emailSentCount}");
        if (count($errors) > 0) {
            $this->error("  - Errors: " . count($errors));
            foreach ($errors as $error) {
                $this->error("    - {$error}");
            }
        }

        return Command::SUCCESS;
    }
}
