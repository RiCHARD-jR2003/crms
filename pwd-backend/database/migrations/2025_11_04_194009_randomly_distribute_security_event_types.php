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
     * Randomly distribute security events across different threat types
     * This creates a more realistic distribution where some threat types
     * appear more frequently than others
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
        
        // Get all event IDs ordered by detected_at
        $eventIds = DB::table('security_events')
            ->orderBy('detected_at', 'asc')
            ->pluck('eventID')
            ->toArray();
        
        // Randomly assign threat types to each event
        // Update events in batches for better performance
        $batchSize = 500;
        for ($i = 0; $i < count($eventIds); $i += $batchSize) {
            $batch = array_slice($eventIds, $i, $batchSize);
            
            foreach ($batch as $eventId) {
                // Randomly select a threat type for each event
                $randomType = $threatTypes[array_rand($threatTypes)];
                
                DB::table('security_events')
                    ->where('eventID', $eventId)
                    ->update([
                        'event_type' => $randomType,
                        'updated_at' => now()
                    ]);
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
