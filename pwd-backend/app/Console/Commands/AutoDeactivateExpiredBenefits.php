<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Benefit;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AutoDeactivateExpiredBenefits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'benefits:auto-deactivate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically deactivate benefits that have reached their expiry date';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting auto-deactivation of expired benefits...');
        
        $now = now(); // Real-time timestamp
        $deactivatedCount = 0;
        
        // Find all active benefits that have passed their expiry date
        $expiredBenefits = Benefit::where('status', 'Active')
            ->whereNotNull('expiryDate')
            ->where('expiryDate', '<=', $now)
            ->get();
        
        foreach ($expiredBenefits as $benefit) {
            $expiryDate = Carbon::parse($benefit->expiryDate);
            
            // Double-check with real-time comparison
            if ($expiryDate->lte($now)) {
                $oldStatus = $benefit->status;
                
                // Update status to Inactive/Completed
                $benefit->update([
                    'status' => 'Inactive',
                    'updated_at' => $now
                ]);
                
                $deactivatedCount++;
                
                Log::info('Benefit auto-deactivated', [
                    'benefit_id' => $benefit->id,
                    'title' => $benefit->title,
                    'old_status' => $oldStatus,
                    'new_status' => 'Inactive',
                    'expiry_date' => $expiryDate->toDateTimeString(),
                    'deactivated_at' => $now->toDateTimeString()
                ]);
                
                $this->line("Deactivated benefit: {$benefit->title} (ID: {$benefit->id})");
            }
        }
        
        $this->info("Auto-deactivation completed. {$deactivatedCount} benefit(s) deactivated.");
        
        if ($deactivatedCount > 0) {
            Log::info('Benefits auto-deactivation summary', [
                'deactivated_count' => $deactivatedCount,
                'timestamp' => $now->toDateTimeString()
            ]);
        }
        
        return Command::SUCCESS;
    }
}

