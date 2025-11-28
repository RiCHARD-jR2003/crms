<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PWDMember;
use App\Models\RenewalSetting;
use App\Models\Notification;
use App\Services\EmailService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CheckCardRenewals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pwd:check-card-renewals';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for PWD cards that need renewal, flag members, and send email reminders';

    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        parent::__construct();
        $this->emailService = $emailService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking for cards that need renewal...');

        // Get configurable renewal days before expiry
        $renewalDaysBeforeExpiry = (int) RenewalSetting::getValue('renewal_days_before_expiry', 30);
        $reminderIntervalDays = (int) RenewalSetting::getValue('renewal_reminder_interval_days', 7);

        $today = Carbon::today();
        $thresholdDate = Carbon::today()->addDays($renewalDaysBeforeExpiry);

        $this->info("Renewal threshold: {$renewalDaysBeforeExpiry} days before expiry");
        $this->info("Reminder interval: {$reminderIntervalDays} days");

        // Find cards that are expiring within the threshold period
        $membersNeedingRenewal = PWDMember::where('cardClaimed', true)
            ->whereNotNull('cardExpirationDate')
            ->whereBetween('cardExpirationDate', [$today, $thresholdDate])
            ->get();

        $flaggedCount = 0;
        $emailSentCount = 0;
        $notificationsCreated = 0;

        foreach ($membersNeedingRenewal as $member) {
            // Flag member for renewal if not already flagged
            if (!$member->isFlaggedForRenewal()) {
                $member->flagForRenewal();
                $flaggedCount++;
                $this->info("Flagged member {$member->pwd_id} for renewal");
            }

            // Send renewal reminder email if needed
            if ($member->shouldSendRenewalReminder($reminderIntervalDays)) {
                $daysRemaining = Carbon::parse($member->cardExpirationDate)->diffInDays($today);

                $emailSent = $this->emailService->sendIDRenewalReminderEmail([
                    'firstName' => $member->firstName,
                    'lastName' => $member->lastName,
                    'email' => $member->email,
                    'barangay' => $member->barangay,
                    'pwdId' => $member->pwd_id,
                    'expirationDate' => $member->cardExpirationDate,
                    'daysRemaining' => $daysRemaining
                ]);

                if ($emailSent) {
                    $member->markRenewalReminderSent();
                    $emailSentCount++;
                    $this->info("Sent renewal reminder email to {$member->email}");
                }
            }

            // Create notification if doesn't exist (last 7 days)
            $sevenDaysAgo = Carbon::today()->subDays(7);
            $existingNotification = Notification::where('user_id', $member->userID)
                ->where('type', 'card_renewal_due')
                ->where('is_read', false)
                ->whereDate('created_at', '>=', $sevenDaysAgo)
                ->first();

            if (!$existingNotification) {
                $daysUntilExpiration = Carbon::parse($member->cardExpirationDate)->diffInDays($today);

                Notification::create([
                    'user_id' => $member->userID,
                    'type' => 'card_renewal_due',
                    'title' => 'PWD Card Renewal Due',
                    'message' => "Your PWD ID card will expire on " . Carbon::parse($member->cardExpirationDate)->format('F d, Y') . " ({$daysUntilExpiration} days remaining). Please submit your renewal request with your old ID card and a recent medical certificate.",
                    'data' => [
                        'member_id' => $member->id,
                        'expiration_date' => $member->cardExpirationDate,
                        'days_remaining' => $daysUntilExpiration
                    ]
                ]);

                $notificationsCreated++;
            }
        }

        // Unflag members whose cards have expired or are no longer in renewal window
        $expiredOrPastThreshold = PWDMember::where('renewal_flag', true)
            ->where(function($query) use ($today, $thresholdDate) {
                $query->whereNull('cardExpirationDate')
                    ->orWhere('cardExpirationDate', '<', $today)
                    ->orWhere('cardExpirationDate', '>', $thresholdDate);
            })
            ->get();

        foreach ($expiredOrPastThreshold as $member) {
            $member->unflagFromRenewal();
            $this->info("Unflagged member {$member->pwd_id} (expired or past threshold)");
        }

        // Log summary
        Log::info('Card renewal check completed', [
            'flagged_count' => $flaggedCount,
            'email_sent_count' => $emailSentCount,
            'notifications_created' => $notificationsCreated,
            'unflagged_count' => $expiredOrPastThreshold->count()
        ]);

        $this->info("Renewal check completed:");
        $this->info("  - Flagged: {$flaggedCount}");
        $this->info("  - Emails sent: {$emailSentCount}");
        $this->info("  - Notifications created: {$notificationsCreated}");
        $this->info("  - Unflagged: {$expiredOrPastThreshold->count()}");

        return 0;
    }
}

