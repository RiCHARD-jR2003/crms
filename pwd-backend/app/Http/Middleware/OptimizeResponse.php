<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OptimizeResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only optimize JSON responses
        if ($response instanceof JsonResponse) {
            $this->optimizeJsonResponse($response, $request);
        }

        // Add performance headers
        $this->addPerformanceHeaders($response);

        return $response;
    }

    /**
     * Optimize JSON response
     */
    protected function optimizeJsonResponse(JsonResponse $response, Request $request)
    {
        // Remove null values from response to reduce payload size
        if ($request->header('X-Optimize-Response') === 'true') {
            $data = $response->getData(true);
            if (is_array($data)) {
                $data = $this->removeNullValues($data);
                $response->setData($data);
            }
        }

        // Minify JSON output (remove pretty printing in production)
        if (app()->environment('production')) {
            $response->setEncodingOptions(JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
    }

    /**
     * Add performance-related headers
     */
    protected function addPerformanceHeaders($response)
    {
        // Cache control for GET requests
        if (request()->isMethod('GET')) {
            // Allow browser caching for static-ish endpoints
            $cacheDuration = $this->getCacheDuration(request()->path());
            if ($cacheDuration > 0) {
                $response->header('Cache-Control', "private, max-age={$cacheDuration}");
            }
        }

        // Add timing header for debugging
        if (defined('LARAVEL_START')) {
            $executionTime = round((microtime(true) - LARAVEL_START) * 1000, 2);
            $response->header('X-Response-Time', $executionTime . 'ms');
        }

        // Security headers
        $response->header('X-Content-Type-Options', 'nosniff');
        $response->header('X-Frame-Options', 'DENY');

        return $response;
    }

    /**
     * Get cache duration based on endpoint
     */
    protected function getCacheDuration($path)
    {
        $cacheRules = [
            'api/document-types' => 3600, // 1 hour
            'api/barangays' => 3600,
            'api/disability-types' => 3600,
            'api/benefits' => 300, // 5 minutes
            'api/announcements' => 120, // 2 minutes
            'api/pwd-members' => 60, // 1 minute
        ];

        foreach ($cacheRules as $pattern => $duration) {
            if (str_starts_with($path, $pattern)) {
                return $duration;
            }
        }

        return 0; // No caching by default
    }

    /**
     * Recursively remove null values from array
     */
    protected function removeNullValues(array $data)
    {
        foreach ($data as $key => $value) {
            if (is_null($value)) {
                unset($data[$key]);
            } elseif (is_array($value)) {
                $data[$key] = $this->removeNullValues($value);
                if (empty($data[$key])) {
                    unset($data[$key]);
                }
            }
        }
        return $data;
    }
}

