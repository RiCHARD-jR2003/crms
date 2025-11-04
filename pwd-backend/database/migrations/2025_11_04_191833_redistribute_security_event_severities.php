<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Redistribute security events severity levels to:
     * 40% Low, 30% Medium, 20% High, 10% Critical
     *
     * @return void
     */
    public function up()
    {
        // Get total count of events
        $totalEvents = DB::table('security_events')->count();
        
        if ($totalEvents === 0) {
            return; // No events to redistribute
        }
        
        // Calculate target counts for each severity
        $lowCount = (int) round($totalEvents * 0.40);      // 40%
        $mediumCount = (int) round($totalEvents * 0.30);  // 30%
        $highCount = (int) round($totalEvents * 0.20);    // 20%
        $criticalCount = $totalEvents - $lowCount - $mediumCount - $highCount; // Remaining for critical (10%)
        
        // Get all event IDs ordered by detected_at
        $eventIds = DB::table('security_events')
            ->orderBy('detected_at', 'asc')
            ->pluck('eventID')
            ->toArray();
        
        // Distribute severity levels
        $severities = [];
        
        // Add Low (40%)
        for ($i = 0; $i < $lowCount; $i++) {
            $severities[] = 'low';
        }
        
        // Add Medium (30%)
        for ($i = 0; $i < $mediumCount; $i++) {
            $severities[] = 'medium';
        }
        
        // Add High (20%)
        for ($i = 0; $i < $highCount; $i++) {
            $severities[] = 'high';
        }
        
        // Add Critical (remaining ~10%)
        for ($i = 0; $i < $criticalCount; $i++) {
            $severities[] = 'critical';
        }
        
        // Shuffle to randomize distribution
        shuffle($severities);
        
        // Update events in batches
        $batchSize = 500;
        for ($i = 0; $i < count($eventIds); $i += $batchSize) {
            $batch = array_slice($eventIds, $i, $batchSize);
            $batchSeverities = array_slice($severities, $i, $batchSize);
            
            foreach ($batch as $index => $eventId) {
                if (isset($batchSeverities[$index])) {
                    DB::table('security_events')
                        ->where('eventID', $eventId)
                        ->update([
                            'severity' => $batchSeverities[$index],
                            'updated_at' => now()
                        ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * Note: Cannot reverse this migration as we don't store original severity levels
     *
     * @return void
     */
    public function down()
    {
        // Cannot reverse - original severity distribution is not stored
        // This migration is meant to be a one-time redistribution
    }
};
