<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $ttl = 60): Response
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Generate cache key
        $cacheKey = 'response_' . md5($request->fullUrl() . $request->user()?->id);

        // Check cache
        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return response()->json($cached)->header('X-Cache', 'HIT');
        }

        // Get response
        $response = $next($request);

        // Cache successful responses
        if ($response->getStatusCode() === 200) {
            $content = $response->getContent();
            $data = json_decode($content, true);
            if ($data !== null) {
                Cache::put($cacheKey, $data, now()->addSeconds($ttl));
            }
        }

        return $response->header('X-Cache', 'MISS');
    }
}

