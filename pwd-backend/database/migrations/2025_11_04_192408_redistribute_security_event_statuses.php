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
     * Redistribute security events statuses to:
     * 25% Pending, 25% Investigated, 30% Resolved, 20% False Positive
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
        
        // Calculate target counts for each status
        $pendingCount = (int) round($totalEvents * 0.25);      // 25%
        $investigatedCount = (int) round($totalEvents * 0.25); // 25%
        $resolvedCount = (int) round($totalEvents * 0.30);     // 30%
        $falsePositiveCount = $totalEvents - $pendingCount - $investigatedCount - $resolvedCount; // Remaining for false_positive (20%)
        
        // Get all event IDs ordered by detected_at
        $eventIds = DB::table('security_events')
            ->orderBy('detected_at', 'asc')
            ->pluck('eventID')
            ->toArray();
        
        // Distribute statuses
        $statuses = [];
        
        // Add Pending (25%)
        for ($i = 0; $i < $pendingCount; $i++) {
            $statuses[] = 'pending';
        }
        
        // Add Investigated (25%)
        for ($i = 0; $i < $investigatedCount; $i++) {
            $statuses[] = 'investigated';
        }
        
        // Add Resolved (30%)
        for ($i = 0; $i < $resolvedCount; $i++) {
            $statuses[] = 'resolved';
        }
        
        // Add False Positive (remaining ~20%)
        for ($i = 0; $i < $falsePositiveCount; $i++) {
            $statuses[] = 'false_positive';
        }
        
        // Shuffle to randomize distribution
        shuffle($statuses);
        
        // Update events in batches
        $batchSize = 500;
        for ($i = 0; $i < count($eventIds); $i += $batchSize) {
            $batch = array_slice($eventIds, $i, $batchSize);
            $batchStatuses = array_slice($statuses, $i, $batchSize);
            
            foreach ($batch as $index => $eventId) {
                if (isset($batchStatuses[$index])) {
                    DB::table('security_events')
                        ->where('eventID', $eventId)
                        ->update([
                            'status' => $batchStatuses[$index],
                            'updated_at' => now()
                        ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * Note: Cannot reverse this migration as we don't store original status values
     *
     * @return void
     */
    public function down()
    {
        // Cannot reverse - original status distribution is not stored
        // This migration is meant to be a one-time redistribution
    }
};
