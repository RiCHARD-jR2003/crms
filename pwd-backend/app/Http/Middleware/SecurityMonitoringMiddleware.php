<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SecurityEvent;
use Illuminate\Support\Facades\Log;

class SecurityMonitoringMiddleware
{
    // Patterns to detect various security threats
    private $sqlInjectionPatterns = [
        '/(\bUNION\b.*\bSELECT\b)/i',
        '/(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i',
        '/(\bDROP\b.*\bTABLE\b)/i',
        '/(\bINSERT\b.*\bINTO\b.*\bVALUES\b)/i',
        '/(\bDELETE\b.*\bFROM\b)/i',
        '/(\bUPDATE\b.*\bSET\b)/i',
        '/(\bOR\b.*1.*=.*1)/i',
        '/(\bOR\b.*\'1\'.*=.*\'1\')/i',
        '/(\';.*--)/i',
        '/(\/\*.*\*\/)/i',
        '/(\bEXEC\b|\bEXECUTE\b)/i',
        '/(\bxp_\w+\b)/i',
    ];

    private $xssPatterns = [
        '/<script[^>]*>.*?<\/script>/is',
        '/javascript:/i',
        '/on\w+\s*=/i', // onclick=, onerror=, etc.
        '/<iframe[^>]*>/i',
        '/<object[^>]*>/i',
        '/<embed[^>]*>/i',
        '/vbscript:/i',
        '/<img[^>]*src[^>]*=.*javascript:/i',
    ];

    private $pathTraversalPatterns = [
        '/\.\.\//',
        '/\.\.\\\\/',
        '/\.\.\%2f/i',
        '/\.\.\%5c/i',
        '/\.\.\%252f/i',
        '/\.\.\%255c/i',
        '/\.\.\%c0%af/i',
        '/\.\.\%c1%9c/i',
    ];

    private $commandInjectionPatterns = [
        '/;\s*(ls|cat|rm|mv|cp|chmod|chown|wget|curl|nc|netcat|telnet|ssh|ping)\s+/i',
        '/\|\s*(ls|cat|rm|mv|cp|chmod|chown|wget|curl|nc|netcat|telnet|ssh|ping)\s+/i',
        '/`[^`]*`/',
        '/\$\([^)]+\)/',
        '/(\||;|&|`|\$\().*(rm|del|mkdir|echo|cat|ls)/i',
    ];

    private $suspiciousPatterns = [
        '/eval\s*\(/i',
        '/base64_decode\s*\(/i',
        '/gzinflate\s*\(/i',
        '/str_rot13\s*\(/i',
        '/exec\s*\(/i',
        '/system\s*\(/i',
        '/passthru\s*\(/i',
        '/shell_exec\s*\(/i',
        '/preg_replace.*\/e/i',
        '/assert\s*\(/i',
        '/file_get_contents\s*\(/i',
        '/file_put_contents\s*\(/i',
    ];

    private $fileUploadThreatPatterns = [
        '/\.(php|phtml|php3|php4|php5|phps|php7|phar|htaccess|htpasswd|ini|sh|bat|cmd|exe|scr|vbs|js|jsp|asp|aspx|pl|py|rb|rbw|scpt|sh|bash|zsh|fish|csh|ksh|ps1|psm1|psd1|ps1xml|pssc|psrc|cdxml|pl|perl|rb|ruby|py|python|rbw|rbs|rbo|gem|gemspec|jbuilder|rabl|podspec|podfile|lock|capfile|Gemfile|Rakefile|ru|rbx|rjs|irbrc|irb_history|irb_session|gemrc|_irbrc|_railsrc|_railsrc|config|environment|application|boot|database|environments|config\.rb|Gemfile\.lock|config\.ru|Rakefile|rakefile|Gemfile|gemfile|Podfile|podfile|\.xcconfig|\.xcworkspace|\.xcuserdata|\.xcodeproj|\.xcassets|\.xcdatamodel|\.xcdatamodeld|\.xcsettings|\.xcuserstate|\.xcplugindata|\.xcdebugger|\.xccheckout|\.xcbkptlist|\.xcscmblueprint|\.xcuserdatad|\.xcscheme|\.xcsettings|\.xcconfig|\.xcworkspace|\.xcdatamodel|\.xcdatamodeld|\.xcassets|\.xcassets|\.xcassets|\.xcassets)$/i',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $this->analyzeRequest($request);
        } catch (\Exception $e) {
            // Don't block the request if security monitoring fails
            Log::error('Security monitoring error: ' . $e->getMessage());
        }

        return $next($request);
    }

    private function analyzeRequest(Request $request)
    {
        $allInput = array_merge(
            $request->all(),
            $request->query->all(),
            $request->headers->all()
        );

        $inputString = json_encode($allInput);
        $url = $request->fullUrl();
        $method = $request->method();

        // Check for SQL Injection
        if ($this->detectPattern($inputString, $this->sqlInjectionPatterns)) {
            $this->logSecurityEvent(
                'SQL_INJECTION',
                'high',
                $request,
                $url,
                $method,
                $allInput,
                'Potential SQL injection attempt detected'
            );
        }

        // Check for XSS
        if ($this->detectPattern($inputString, $this->xssPatterns)) {
            $this->logSecurityEvent(
                'XSS',
                'high',
                $request,
                $url,
                $method,
                $allInput,
                'Potential XSS (Cross-Site Scripting) attempt detected'
            );
        }

        // Check for Path Traversal
        if ($this->detectPattern($inputString, $this->pathTraversalPatterns)) {
            $this->logSecurityEvent(
                'PATH_TRAVERSAL',
                'high',
                $request,
                $url,
                $method,
                $allInput,
                'Potential path traversal attempt detected'
            );
        }

        // Check for Command Injection
        if ($this->detectPattern($inputString, $this->commandInjectionPatterns)) {
            $this->logSecurityEvent(
                'COMMAND_INJECTION',
                'critical',
                $request,
                $url,
                $method,
                $allInput,
                'Potential command injection attempt detected'
            );
        }

        // Check for Suspicious Patterns (eval, base64_decode, etc.)
        if ($this->detectPattern($inputString, $this->suspiciousPatterns)) {
            $this->logSecurityEvent(
                'SUSPICIOUS_PATTERN',
                'medium',
                $request,
                $url,
                $method,
                $allInput,
                'Suspicious pattern detected in request'
            );
        }

        // Check file uploads
        if ($request->hasFile('file') || $request->hasFile('document') || $request->hasFile('image')) {
            $files = $request->allFiles();
            foreach ($files as $file) {
                if (is_array($file)) {
                    foreach ($file as $singleFile) {
                        if ($singleFile->isValid()) {
                            $this->checkFileUpload($singleFile, $request, $url, $method);
                        }
                    }
                } elseif ($file->isValid()) {
                    $this->checkFileUpload($file, $request, $url, $method);
                }
            }
        }

        // Check for excessive request size (potential DoS)
        if ($request->getContentLength() > 10485760) { // 10MB
            $this->logSecurityEvent(
                'SUSPICIOUS_PATTERN',
                'medium',
                $request,
                $url,
                $method,
                ['size' => $request->getContentLength()],
                'Very large request detected (potential DoS attempt)'
            );
        }

        // Check for brute force (multiple failed login attempts)
        $this->checkBruteForce($request, $url, $method);
    }

    private function detectPattern($input, $patterns)
    {
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }
        return false;
    }

    private function checkFileUpload($file, Request $request, $url, $method)
    {
        $filename = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        
        // Check filename for suspicious patterns
        if ($this->detectPattern($filename, $this->fileUploadThreatPatterns)) {
            $this->logSecurityEvent(
                'FILE_UPLOAD_THREAT',
                'high',
                $request,
                $url,
                $method,
                ['filename' => $filename, 'extension' => $extension, 'mime_type' => $file->getMimeType()],
                'Potentially malicious file upload detected',
                $filename
            );
        }

        // Check MIME type mismatch
        $mimeType = $file->getMimeType();
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!in_array($mimeType, $allowedMimes)) {
            $this->logSecurityEvent(
                'FILE_UPLOAD_THREAT',
                'medium',
                $request,
                $url,
                $method,
                ['filename' => $filename, 'extension' => $extension, 'mime_type' => $mimeType],
                'Suspicious MIME type detected in file upload',
                $filename
            );
        }
    }

    private function checkBruteForce(Request $request, $url, $method)
    {
        // This is a simple check - in production, you'd want to use rate limiting middleware
        // or check against a cache/database of recent failed attempts
        if (strpos($url, '/login') !== false || strpos($url, '/api/auth/login') !== false) {
            $ipAddress = $request->ip();
            
            // In a real scenario, you'd check failed attempts from cache/DB
            // For now, we'll just log suspicious login patterns
            if ($request->method() === 'POST') {
                // Could enhance this to track actual brute force patterns
            }
        }
    }

    private function logSecurityEvent($eventType, $severity, Request $request, $url, $method, $requestData, $description, $detectedPattern = null)
    {
        try {
            $pattern = $detectedPattern ?: $this->extractPattern(json_encode($requestData));
            
            SecurityEvent::create([
                'event_type' => $eventType,
                'severity' => $severity,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'userID' => $request->user()?->userID,
                'url' => $url,
                'method' => $method,
                'request_data' => $requestData,
                'description' => $description,
                'detected_pattern' => $pattern,
                'status' => 'pending',
                'detected_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log security event: ' . $e->getMessage());
        }
    }

    private function extractPattern($data)
    {
        // Extract the suspicious pattern from the data
        $patterns = array_merge(
            $this->sqlInjectionPatterns,
            $this->xssPatterns,
            $this->pathTraversalPatterns,
            $this->commandInjectionPatterns,
            $this->suspiciousPatterns
        );

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $data, $matches)) {
                return substr($matches[0], 0, 200); // Limit length
            }
        }

        return 'Pattern detected';
    }
}
