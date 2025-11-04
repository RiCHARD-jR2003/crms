<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PWDMember;
use Carbon\Carbon;

class SetMembersForRenewal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pwd:set-renewal-status {--count=50 : Number of members to set for renewal}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set some PWD members\' cards to "for renewal" status by updating expiration dates';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $count = (int) $this->option('count');
        
        $this->info("Setting {$count} members to 'for renewal' status...");

        // First, claim some cards if needed
        $unclaimedMembers = PWDMember::where('cardClaimed', false)
            ->whereNotNull('pwd_id')
            ->limit($count)
            ->get();

        if ($unclaimedMembers->isNotEmpty()) {
            $this->info("Claiming {$unclaimedMembers->count()} cards first...");
            
            foreach ($unclaimedMembers as $member) {
                $issueDate = Carbon::now()->subYears(3)->subDays(rand(1, 30)); // Issue date 3 years ago, expiring soon
                $expirationDate = Carbon::today()->addDays(rand(1, 30)); // Expires in 1-30 days
                
                $member->update([
                    'cardClaimed' => true,
                    'cardIssueDate' => $issueDate,
                    'cardExpirationDate' => $expirationDate
                ]);
            }
        }

        // Now get claimed members and set some to renewal status
        $today = Carbon::today();
        $oneMonthFromNow = Carbon::today()->addMonth();

        // Get claimed members that are not currently in renewal window
        $membersToUpdate = PWDMember::where('cardClaimed', true)
            ->where(function($query) use ($today, $oneMonthFromNow) {
                // Get members whose cards are either:
                // 1. Expiring more than 1 month away (so we can set them to renewal)
                // 2. Already expired (but still claimed)
                // 3. Have no expiration date but are claimed
                $query->whereNull('cardExpirationDate')
                    ->orWhere('cardExpirationDate', '>', $oneMonthFromNow->toDateString())
                    ->orWhere('cardExpirationDate', '<', $today->toDateString());
            })
            ->limit($count)
            ->get();

        if ($membersToUpdate->isEmpty()) {
            // If still empty, get any claimed members
            $membersToUpdate = PWDMember::where('cardClaimed', true)
                ->limit($count)
                ->get();
        }

        if ($membersToUpdate->isEmpty()) {
            $this->error('No members found to update. Please ensure there are PWD members with pwd_id assigned.');
            return 1;
        }

        $updated = 0;
        $daysRange = [1, 30]; // Cards will expire between 1-30 days from now

        foreach ($membersToUpdate as $member) {
            // Set expiration date to be between 1-30 days from now
            $daysUntilExpiration = rand($daysRange[0], $daysRange[1]);
            $newExpirationDate = Carbon::today()->addDays($daysUntilExpiration);

            $member->update([
                'cardExpirationDate' => $newExpirationDate,
                'cardIssueDate' => Carbon::today()->subYears(3)->subDays($daysUntilExpiration) // Set issue date to 3 years ago minus days until expiration
            ]);

            $updated++;
        }

        $this->info("Successfully set {$updated} members to 'for renewal' status.");
        $this->info("Their cards will expire between 1-30 days from today.");

        return 0;
    }
}

