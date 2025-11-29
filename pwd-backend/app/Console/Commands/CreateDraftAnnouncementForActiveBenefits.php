<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Benefit;
use App\Models\Announcement;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CreateDraftAnnouncementForActiveBenefits extends Command
{
    protected $signature = 'benefits:create-draft-announcements';
    protected $description = 'Create draft announcements for active benefits that do not have announcements';

    public function handle()
    {
        $this->info('Checking for active benefits without announcements...');
        
        $activeBenefits = Benefit::where('status', 'Active')->get();
        $created = 0;
        $skipped = 0;
        
        foreach ($activeBenefits as $benefit) {
            // Check if announcement already exists for this benefit
            $existingAnnouncement = Announcement::where('benefitID', $benefit->id)->first();
            
            if ($existingAnnouncement) {
                $this->line("Benefit ID {$benefit->id} already has an announcement. Skipping...");
                $skipped++;
                continue;
            }
            
            try {
                // Use BenefitController's template generation methods via reflection
                $controller = new \App\Http\Controllers\API\BenefitController();
                $reflection = new \ReflectionClass($controller);
                
                // Get selected barangays
                $selectedBarangays = [];
                if ($benefit->selectedBarangays && is_array($benefit->selectedBarangays) && count($benefit->selectedBarangays) > 0) {
                    $selectedBarangays = $benefit->selectedBarangays;
                } elseif ($benefit->barangay && $benefit->barangay !== 'All') {
                    $selectedBarangays = [$benefit->barangay];
                }
                
                // Generate title using standardized template
                $generateTitleMethod = $reflection->getMethod('generateAnnouncementTitle');
                $generateTitleMethod->setAccessible(true);
                $title = $generateTitleMethod->invoke($controller, $benefit, $selectedBarangays);
                
                // Generate description using standardized template
                $distributionDate = $benefit->distributionDate ? Carbon::parse($benefit->distributionDate) : null;
                $expiryDate = $benefit->expiryDate ? Carbon::parse($benefit->expiryDate) : null;
                $generateDescMethod = $reflection->getMethod('generateAnnouncementDescription');
                $generateDescMethod->setAccessible(true);
                $content = $generateDescMethod->invoke($controller, $benefit, $selectedBarangays, $distributionDate, $expiryDate);
                
                // Determine target audience
                $targetAudience = count($selectedBarangays) > 0 
                    ? implode(', ', $selectedBarangays) 
                    : 'All Barangays';
                
                // Create draft announcement
                $announcement = Announcement::create([
                    'authorID' => 1, // Default admin user
                    'benefitID' => $benefit->id,
                    'title' => $title,
                    'content' => $content,
                    'type' => 'Event',
                    'category' => 'Ayuda Program',
                    'priority' => 'High',
                    'targetAudience' => $targetAudience,
                    'status' => 'Draft',
                    'publishDate' => now()->toDateString(), // Auto-suggested as current date
                    'expiryDate' => $expiryDate ? $expiryDate->toDateString() : null, // Auto-suggested based on benefit validity
                    'views' => 0
                ]);
                
                $this->info("Created draft announcement for Benefit ID {$benefit->id}");
                $created++;
            } catch (\Exception $e) {
                $this->error("Failed to create announcement for Benefit ID {$benefit->id}: " . $e->getMessage());
                Log::error('Failed to create draft announcement for benefit: ' . $e->getMessage(), [
                    'benefit_id' => $benefit->id,
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }
        
        $this->info("Completed! Created {$created} draft announcements, skipped {$skipped} benefits.");
        return 0;
    }
}

