<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerifySampleData extends Command
{
    protected $signature = 'pwd:verify-sample-data';
    protected $description = 'Verify sample data distribution';

    public function handle()
    {
        $this->info('=== Sample Data Verification ===');
        
        $users = DB::table('users')
            ->where('role', 'PWDMember')
            ->where('email', 'like', '%@sample.pwd.local')
            ->count();
        
        $members = DB::table('pwd_members')
            ->where('email', 'like', '%@sample.pwd.local')
            ->count();
        
        $applications = DB::table('application')
            ->where('email', 'like', '%@sample.pwd.local')
            ->count();
        
        $pwdMemberIds = DB::table('pwd_members')
            ->where('email', 'like', '%@sample.pwd.local')
            ->pluck('id')
            ->toArray();
        
        $tickets = DB::table('support_tickets')
            ->whereIn('pwd_member_id', $pwdMemberIds)
            ->count();
        
        $pwdUserIds = DB::table('pwd_members')
            ->where('email', 'like', '%@sample.pwd.local')
            ->pluck('userID')
            ->toArray();
        
        $claims = DB::table('benefit_claim')
            ->whereIn('pwdID', $pwdUserIds)
            ->count();
        
        $this->info("Users (PWDMember): {$users}");
        $this->info("PWD Members: {$members}");
        $this->info("Applications: {$applications}");
        $this->info("Support Tickets: {$tickets}");
        $this->info("Benefit Claims: {$claims}");
        
        $this->info("\n=== Barangay Distribution ===");
        $barangays = DB::table('pwd_members')
            ->where('email', 'like', '%@sample.pwd.local')
            ->select('barangay', DB::raw('count(*) as count'))
            ->groupBy('barangay')
            ->orderBy('barangay')
            ->get();
        
        foreach ($barangays as $b) {
            $this->info("  {$b->barangay}: {$b->count}");
        }
        
        $this->info("\n=== Disability Type Distribution ===");
        $disabilities = DB::table('pwd_members')
            ->where('email', 'like', '%@sample.pwd.local')
            ->select('disabilityType', DB::raw('count(*) as count'))
            ->groupBy('disabilityType')
            ->orderBy('disabilityType')
            ->get();
        
        foreach ($disabilities as $d) {
            $this->info("  {$d->disabilityType}: {$d->count}");
        }
        
        $this->info("\n=== Application Status Distribution ===");
        $statuses = DB::table('application')
            ->where('email', 'like', '%@sample.pwd.local')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->orderBy('status')
            ->get();
        
        foreach ($statuses as $s) {
            $this->info("  {$s->status}: {$s->count}");
        }
        
        return 0;
    }
}

