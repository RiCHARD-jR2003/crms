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
     * @return void
     */
    public function up()
    {
        // Map of event types to their corresponding descriptions
        $descriptions = [
            'SQL_INJECTION' => 'Potential SQL injection attempt detected',
            'XSS' => 'Potential XSS (Cross-Site Scripting) attempt detected',
            'PATH_TRAVERSAL' => 'Potential path traversal attempt detected',
            'COMMAND_INJECTION' => 'Potential command injection attempt detected',
            'SUSPICIOUS_PATTERN' => 'Suspicious pattern detected in request',
            'FILE_UPLOAD_THREAT' => 'Potentially malicious file upload detected',
            'SSRF' => 'Potential SSRF (Server-Side Request Forgery) attempt detected',
            'LDAP_INJECTION' => 'Potential LDAP injection attempt detected',
            'XML_INJECTION' => 'Potential XML injection attempt detected',
            'TEMPLATE_INJECTION' => 'Potential template injection attempt detected',
            'RATE_LIMIT_VIOLATION' => 'Rate limit violation detected - excessive requests from IP',
            'API_ABUSE' => 'Suspicious API access detected - missing or suspicious user agent',
            'MALICIOUS_BOT' => 'Malicious bot or security scanner detected',
            'SENSITIVE_DATA_EXPOSURE' => 'Potential sensitive data exposure detected',
            'DIRECTORY_LISTING_ATTEMPT' => 'Directory listing or sensitive file access attempt detected',
            'UNAUTHORIZED_ACCESS' => 'Unauthorized access attempt to protected route',
        ];

        // Update descriptions for each event type
        foreach ($descriptions as $eventType => $description) {
            DB::table('security_events')
                ->where('event_type', $eventType)
                ->update(['description' => $description]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Reset descriptions to a generic value
        DB::table('security_events')
            ->update(['description' => 'Security event detected']);
    }
};
