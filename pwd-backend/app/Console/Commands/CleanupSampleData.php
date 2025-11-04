<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\PWDMember;
use App\Models\Application;
use App\Models\SupportTicket;
use App\Models\BenefitClaim;
use App\Models\Benefit;

class CleanupSampleData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pwd:cleanup-sample-data {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove all sample data (PWD members, applications, tickets, benefits) while preserving admin, staff, frontdesk, and barangay president accounts';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting sample data cleanup...');
        $this->info('This will remove all sample PWD members, applications, support tickets, and benefit claims.');
        $this->info('Admin, Staff, FrontDesk, and Barangay President accounts will be preserved.');
        $this->newLine();

        if (!$this->option('force')) {
            if (!$this->confirm('Are you sure you want to continue? This action cannot be undone.', false)) {
                $this->info('Cleanup cancelled.');
                return 0;
            }
        }

        // Get roles to preserve
        $preservedRoles = ['Admin', 'SuperAdmin', 'Staff1', 'Staff2', 'FrontDesk', 'BarangayPresident'];
        
        // Get preserved user IDs
        $preservedUserIds = User::whereIn('role', $preservedRoles)
            ->pluck('userID')
            ->toArray();

        $this->info('Preserving accounts with roles: ' . implode(', ', $preservedRoles));
        $this->info('Found ' . count($preservedUserIds) . ' accounts to preserve.');
        $this->newLine();

        // Start transaction
        DB::beginTransaction();

        try {
            // Step 1: Delete benefit claims from sample PWD members
            $this->info('Step 1: Removing benefit claims from sample data...');
            $samplePwdMemberIds = DB::table('pwd_members')
                ->whereNotIn('userID', $preservedUserIds)
                ->pluck('userID')
                ->toArray();
            
            $benefitClaimsDeleted = BenefitClaim::whereIn('pwdID', $samplePwdMemberIds)->delete();
            $this->info("   Deleted {$benefitClaimsDeleted} benefit claims.");

            // Step 2: Delete support tickets and messages
            $this->info('Step 2: Removing support tickets and messages...');
            $samplePwdMemberDbIds = DB::table('pwd_members')
                ->whereNotIn('userID', $preservedUserIds)
                ->pluck('id')
                ->toArray();
            
            // Delete support ticket messages first
            $ticketIds = SupportTicket::whereIn('pwd_member_id', $samplePwdMemberDbIds)
                ->pluck('id')
                ->toArray();
            
            if (!empty($ticketIds)) {
                DB::table('support_ticket_messages')
                    ->whereIn('support_ticket_id', $ticketIds)
                    ->delete();
            }
            
            $ticketsDeleted = SupportTicket::whereIn('pwd_member_id', $samplePwdMemberDbIds)->delete();
            $this->info("   Deleted {$ticketsDeleted} support tickets.");

            // Step 3: Delete applications
            $this->info('Step 3: Removing applications...');
            $sampleUserEmails = DB::table('users')
                ->whereNotIn('userID', $preservedUserIds)
                ->where('role', 'PWDMember')
                ->pluck('email')
                ->toArray();
            
            $applicationsDeleted = Application::whereIn('email', $sampleUserEmails)->delete();
            $this->info("   Deleted {$applicationsDeleted} applications.");

            // Step 4: Delete PWD members
            $this->info('Step 4: Removing PWD members...');
            $pwdMembersDeleted = PWDMember::whereNotIn('userID', $preservedUserIds)->delete();
            $this->info("   Deleted {$pwdMembersDeleted} PWD members.");

            // Step 5: Delete PWD member users (preserve admin/staff accounts)
            $this->info('Step 5: Removing PWD member user accounts...');
            $usersDeleted = User::whereNotIn('userID', $preservedUserIds)
                ->where('role', 'PWDMember')
                ->delete();
            $this->info("   Deleted {$usersDeleted} user accounts.");

            // Step 6: Delete sample benefits (optional - only if they were created by seeders)
            $this->info('Step 6: Checking for sample benefits...');
            $sampleBenefits = Benefit::where('description', 'like', '%sample%')
                ->orWhere('description', 'like', '%Quarterly financial assistance%')
                ->orWhere('description', 'like', '%Cash gift on birthday%')
                ->get();
            
            $benefitsDeleted = 0;
            if ($sampleBenefits->isNotEmpty()) {
                // Only delete if there are no active claims
                $benefitsToDelete = [];
                foreach ($sampleBenefits as $benefit) {
                    $claimsCount = BenefitClaim::where('benefitID', $benefit->id)->count();
                    if ($claimsCount === 0) {
                        $benefitsToDelete[] = $benefit->id;
                    }
                }
                
                if (!empty($benefitsToDelete)) {
                    $benefitsDeleted = Benefit::whereIn('id', $benefitsToDelete)->delete();
                    $this->info("   Deleted {$benefitsDeleted} sample benefits.");
                } else {
                    $this->info("   Skipped deleting benefits (they have active claims).");
                }
            } else {
                $this->info("   No sample benefits found.");
            }

            // Commit transaction
            DB::commit();

            $this->newLine();
            $this->info('✅ Sample data cleanup completed successfully!');
            $this->info('Preserved accounts: ' . count($preservedUserIds));
            $this->info('Summary:');
            $this->info("  - Deleted {$benefitClaimsDeleted} benefit claims");
            $this->info("  - Deleted {$ticketsDeleted} support tickets");
            $this->info("  - Deleted {$applicationsDeleted} applications");
            $this->info("  - Deleted {$pwdMembersDeleted} PWD members");
            $this->info("  - Deleted {$usersDeleted} user accounts");
            if (isset($benefitsDeleted) && $benefitsDeleted > 0) {
                $this->info("  - Deleted {$benefitsDeleted} sample benefits");
            }

            return 0;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Error during cleanup: ' . $e->getMessage());
            $this->error('Transaction rolled back. No changes were made.');
            return 1;
        }
    }
}

