<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PWDMember;
use Carbon\Carbon;

class SetMembersToClaimStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pwd:set-to-claim-status {--count=30 : Number of members to set to "to claim" status}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set some PWD members\' cards to "to claim" status by unclaiming them';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $count = (int) $this->option('count');
        
        $this->info("Setting {$count} members to 'to claim' status...");

        // Get members that are currently claimed or have expiration dates
        // We'll set them to unclaimed status
        $membersToUpdate = PWDMember::whereNotNull('pwd_id')
            ->where(function($query) {
                // Get members that are either claimed or have expiration dates
                $query->where('cardClaimed', true)
                    ->orWhereNotNull('cardExpirationDate');
            })
            ->limit($count)
            ->get();

        if ($membersToUpdate->isEmpty()) {
            // If no claimed members, get any members with pwd_id
            $membersToUpdate = PWDMember::whereNotNull('pwd_id')
                ->limit($count)
                ->get();
        }

        if ($membersToUpdate->isEmpty()) {
            $this->error('No members found to update. Please ensure there are PWD members with pwd_id assigned.');
            return 1;
        }

        $updated = 0;

        foreach ($membersToUpdate as $member) {
            // Set to unclaimed status - clear cardClaimed, cardIssueDate, and cardExpirationDate
            $member->update([
                'cardClaimed' => false,
                'cardIssueDate' => null,
                'cardExpirationDate' => null
            ]);

            $updated++;
        }

        $this->info("Successfully set {$updated} members to 'to claim' status.");
        $this->info("These members now have unclaimed cards.");

        return 0;
    }
}

