<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Application;
use App\Models\PWDMember;
use App\Models\MemberDocument;
use App\Services\DocumentMigrationService;
use Illuminate\Support\Facades\Log;

class MigrateMissingMemberDocuments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pwd:migrate-missing-documents {--member-id= : Specific member ID to migrate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate documents from approved applications to member_documents for members who are missing documents';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting document migration for members missing documents...');

        $memberId = $this->option('member-id');
        
        if ($memberId) {
            // Migrate for specific member
            $member = PWDMember::find($memberId);
            if (!$member) {
                $this->error("Member with ID {$memberId} not found.");
                return 1;
            }
            $members = collect([$member]);
        } else {
            // Get all members who have approved applications but no documents
            $members = PWDMember::whereDoesntHave('memberDocuments')
                ->orWhereHas('memberDocuments', function($query) {
                    $query->where('status', '!=', 'approved');
                }, '=', 0)
                ->get();
        }

        if ($members->isEmpty()) {
            $this->info('No members found missing documents.');
            return 0;
        }

        $this->info("Found {$members->count()} member(s) to process.");

        $migrationService = new DocumentMigrationService();
        $totalMigrated = 0;
        $totalSkipped = 0;

        foreach ($members as $member) {
            // Find the approved application for this member
            $application = Application::where('pwdID', $member->userID)
                ->where('status', 'Approved')
                ->first();

            if (!$application) {
                $this->warn("No approved application found for member ID {$member->userID} ({$member->firstName} {$member->lastName})");
                $totalSkipped++;
                continue;
            }

            // Check if user exists
            $user = $member->user;
            if (!$user) {
                $this->warn("No user account found for member ID {$member->userID}");
                $totalSkipped++;
                continue;
            }

            $this->info("Migrating documents for member: {$member->firstName} {$member->lastName} (ID: {$member->userID})");

            // Migrate documents
            $result = $migrationService->migrateApplicationDocuments($application, $user);

            if ($result['success']) {
                $migratedCount = $result['migrated_count'] ?? 0;
                $totalMigrated += $migratedCount;
                $this->info("  ✓ Migrated {$migratedCount} document(s)");
            } else {
                $this->error("  ✗ Migration failed: " . ($result['error'] ?? 'Unknown error'));
                $totalSkipped++;
            }
        }

        $this->info("\nMigration completed!");
        $this->info("Total documents migrated: {$totalMigrated}");
        $this->info("Members skipped: {$totalSkipped}");

        return 0;
    }
}

