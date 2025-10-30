<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log as LaravelLog;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        try {
            $user = $request->user();

            // Skip if no authenticated user or if hitting audit log listing endpoints to avoid noise
            if (!$user) {
                return $response;
            }

            $path = $request->path();
            if (preg_match('#^api/(audit-logs)#', $path)) {
                return $response;
            }

            // Compose action string
            $action = sprintf('%s %s', $request->method(), '/' . ltrim($path, '/'));

            // Attempt DB insert; if schema is not ready, log to application log gracefully
            try {
                AuditLog::create([
                    'userID' => $user->userID,
                    'action' => $action,
                    'timestamp' => now(),
                ]);
            } catch (\Throwable $e) {
                LaravelLog::warning('AuditLog DB insert failed; falling back to file log', [
                    'userID' => $user->userID,
                    'action' => $action,
                    'error' => $e->getMessage(),
                ]);
            }
        } catch (\Throwable $e) {
            // Never block the request due to audit failures
            LaravelLog::error('AuditLog middleware error: ' . $e->getMessage());
        }

        return $response;
    }
}


