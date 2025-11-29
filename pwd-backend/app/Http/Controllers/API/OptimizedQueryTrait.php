<?php

namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

trait OptimizedQueryTrait
{
    /**
     * Get cached query result with automatic cache invalidation
     *
     * @param string $cacheKey
     * @param int $ttl Time to live in seconds
     * @param callable $callback
     * @return mixed
     */
    protected function getCached($cacheKey, $ttl, callable $callback)
    {
        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * Clear cache by pattern
     *
     * @param string $pattern
     * @return void
     */
    protected function clearCachePattern($pattern)
    {
        // For Redis cache driver
        if (config('cache.default') === 'redis') {
            $keys = Cache::getRedis()->keys($pattern);
            if (!empty($keys)) {
                Cache::getRedis()->del($keys);
            }
        } else {
            // For other cache drivers, clear specific known keys
            // This is a fallback - ideally use Redis for pattern-based clearing
        }
    }

    /**
     * Execute query with query logging disabled for performance
     *
     * @param callable $callback
     * @return mixed
     */
    protected function executeOptimized(callable $callback)
    {
        $originalLogging = DB::getEventDispatcher()->hasListeners('Illuminate\Database\Events\QueryExecuted');
        
        if ($originalLogging) {
            DB::connection()->disableQueryLog();
        }
        
        try {
            $result = $callback();
        } finally {
            if ($originalLogging) {
                DB::connection()->enableQueryLog();
            }
        }
        
        return $result;
    }

    /**
     * Chunk query results for large datasets
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $chunkSize
     * @param callable $callback
     * @return void
     */
    protected function chunkOptimized($query, $chunkSize, callable $callback)
    {
        $query->chunk($chunkSize, function($items) use ($callback) {
            $callback($items);
        });
    }
}

