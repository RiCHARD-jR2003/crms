<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Benefit;
use App\Models\Announcement;
use App\Http\Controllers\API\BenefitController;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class UpdateAnnouncementTemplate extends Command
{
    protected $signature = 'announcements:update-template {--benefit-id= : Update announcement for specific benefit ID}';
    protected $description = 'Update existing announcements to use the new standardized template';

    public function handle()
    {
        $benefitId = $this->option('benefit-id');
        
        if ($benefitId) {
            // Update specific benefit's announcement
            $benefit = Benefit::find($benefitId);
            if (!$benefit) {
                $this->error("Benefit ID {$benefitId} not found.");
                return 1;
            }
            
            $announcement = Announcement::where('benefitID', $benefitId)->first();
            if (!$announcement) {
                $this->error("No announcement found for Benefit ID {$benefitId}.");
                return 1;
            }
            
            $this->updateAnnouncement($benefit, $announcement);
        } else {
            // Update all announcements with benefitID
            $announcements = Announcement::whereNotNull('benefitID')->get();
            
            if ($announcements->isEmpty()) {
                $this->info('No announcements with benefitID found.');
                return 0;
            }
            
            $this->info("Found {$announcements->count()} announcement(s) to update.");
            
            foreach ($announcements as $announcement) {
                $benefit = Benefit::find($announcement->benefitID);
                if ($benefit) {
                    $this->updateAnnouncement($benefit, $announcement);
                } else {
                    $this->warn("Benefit ID {$announcement->benefitID} not found for announcement ID {$announcement->announcementID}.");
                }
            }
        }
        
        return 0;
    }
    
    private function updateAnnouncement($benefit, $announcement)
    {
        try {
            // Use the BenefitController's template generation methods
            $controller = new BenefitController();
            
            // Get selected barangays
            $selectedBarangays = [];
            if ($benefit->selectedBarangays && is_array($benefit->selectedBarangays) && count($benefit->selectedBarangays) > 0) {
                $selectedBarangays = $benefit->selectedBarangays;
            } elseif ($benefit->barangay && $benefit->barangay !== 'All') {
                $selectedBarangays = [$benefit->barangay];
            }
            
            // Generate new title using reflection to access private method
            $reflection = new \ReflectionClass($controller);
            $generateTitleMethod = $reflection->getMethod('generateAnnouncementTitle');
            $generateTitleMethod->setAccessible(true);
            $newTitle = $generateTitleMethod->invoke($controller, $benefit, $selectedBarangays);
            
            // Generate new description
            $distributionDate = $benefit->distributionDate ? Carbon::parse($benefit->distributionDate) : null;
            $expiryDate = $benefit->expiryDate ? Carbon::parse($benefit->expiryDate) : null;
            $generateDescMethod = $reflection->getMethod('generateAnnouncementDescription');
            $generateDescMethod->setAccessible(true);
            $newDescription = $generateDescMethod->invoke($controller, $benefit, $selectedBarangays, $distributionDate, $expiryDate);
            
            // Update target audience
            $targetAudience = count($selectedBarangays) > 0 
                ? implode(', ', $selectedBarangays) 
                : 'All Barangays';
            
            // Update announcement (preserve status if it's Active, otherwise keep as Draft)
            $announcement->update([
                'title' => $newTitle,
                'content' => $newDescription,
                'targetAudience' => $targetAudience,
                'publishDate' => $announcement->publishDate ?: now()->toDateString(),
                'expiryDate' => $expiryDate ? $expiryDate->toDateString() : $announcement->expiryDate,
            ]);
            
            $this->info("Updated announcement ID {$announcement->announcementID} for Benefit ID {$benefit->id}");
            $this->line("  New Title: {$newTitle}");
            
        } catch (\Exception $e) {
            $this->error("Failed to update announcement for Benefit ID {$benefit->id}: " . $e->getMessage());
            Log::error('Failed to update announcement template: ' . $e->getMessage(), [
                'benefit_id' => $benefit->id,
                'announcement_id' => $announcement->announcementID,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}

