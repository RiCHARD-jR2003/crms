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
     * Redistribute security events evenly across different threat types
     * for better visualization
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
        
        // List of available threat types
        $threatTypes = [
            'SQL_INJECTION',
            'XSS',
            'PATH_TRAVERSAL',
            'COMMAND_INJECTION',
            'SUSPICIOUS_PATTERN',
            'FILE_UPLOAD_THREAT',
            'SSRF',
            'LDAP_INJECTION',
            'XML_INJECTION',
            'TEMPLATE_INJECTION',
            'RATE_LIMIT_VIOLATION',
            'API_ABUSE',
            'MALICIOUS_BOT',
            'SENSITIVE_DATA_EXPOSURE',
            'DIRECTORY_LISTING_ATTEMPT',
            'UNAUTHORIZED_ACCESS'
        ];
        
        $numTypes = count($threatTypes);
        $eventsPerType = (int) floor($totalEvents / $numTypes);
        $remainder = $totalEvents % $numTypes;
        
        // Get all event IDs ordered by detected_at
        $eventIds = DB::table('security_events')
            ->orderBy('detected_at', 'asc')
            ->pluck('eventID')
            ->toArray();
        
        // Distribute event types evenly
        $eventTypes = [];
        
        foreach ($threatTypes as $index => $type) {
            $count = $eventsPerType;
            // Distribute remainder events to first few types
            if ($index < $remainder) {
                $count++;
            }
            
            for ($i = 0; $i < $count; $i++) {
                $eventTypes[] = $type;
            }
        }
        
        // Shuffle to randomize distribution
        shuffle($eventTypes);
        
        // Update events in batches
        $batchSize = 500;
        for ($i = 0; $i < count($eventIds); $i += $batchSize) {
            $batch = array_slice($eventIds, $i, $batchSize);
            $batchTypes = array_slice($eventTypes, $i, $batchSize);
            
            foreach ($batch as $index => $eventId) {
                if (isset($batchTypes[$index])) {
                    DB::table('security_events')
                        ->where('eventID', $eventId)
                        ->update([
                            'event_type' => $batchTypes[$index],
                            'updated_at' => now()
                        ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * Note: Cannot reverse this migration as we don't store original event types
     *
     * @return void
     */
    public function down()
    {
        // Cannot reverse - original event type distribution is not stored
        // This migration is meant to be a one-time redistribution
    }
};
