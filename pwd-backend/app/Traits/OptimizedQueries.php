<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

/**
 * Trait for optimized database queries
 * Use this trait in models or controllers for better performance
 */
trait OptimizedQueries
{
    /**
     * Cache duration in seconds for different query types
     */
    protected static $cacheDurations = [
        'list' => 300,      // 5 minutes for list queries
        'single' => 600,    // 10 minutes for single item queries
        'count' => 120,     // 2 minutes for count queries
        'stats' => 300,     // 5 minutes for statistics
    ];

    /**
     * Get cached data or execute query
     */
    public static function getCachedOrQuery(string $cacheKey, callable $queryCallback, string $type = 'list')
    {
        $duration = static::$cacheDurations[$type] ?? static::$cacheDurations['list'];
        
        return Cache::remember($cacheKey, $duration, $queryCallback);
    }

    /**
     * Paginate with caching
     */
    public static function paginatedWithCache(Builder $query, int $perPage = 20, int $page = 1, string $cacheKey = null)
    {
        $key = $cacheKey ?? static::generateCacheKey($query, "paginated_{$perPage}_{$page}");
        
        return Cache::remember($key, 60, function () use ($query, $perPage) {
            return $query->paginate($perPage);
        });
    }

    /**
     * Generate cache key from query
     */
    protected static function generateCacheKey(Builder $query, string $suffix = '')
    {
        $table = $query->getModel()->getTable();
        $queryHash = md5($query->toSql() . serialize($query->getBindings()));
        
        return "query_{$table}_{$queryHash}_{$suffix}";
    }

    /**
     * Scope for selecting only essential columns
     * Override in model to customize
     */
    public function scopeSelectEssential(Builder $query)
    {
        // Default implementation - override in model
        return $query;
    }

    /**
     * Scope for eager loading common relationships
     */
    public function scopeWithCommonRelations(Builder $query)
    {
        // Default implementation - override in model
        return $query;
    }

    /**
     * Scope for recent items
     */
    public function scopeRecentFirst(Builder $query, string $column = 'created_at')
    {
        return $query->orderBy($column, 'desc');
    }

    /**
     * Scope for active items
     */
    public function scopeActive(Builder $query)
    {
        if (in_array('status', $this->getFillable())) {
            return $query->where('status', 'Active');
        }
        return $query;
    }

    /**
     * Batch update with chunking for large datasets
     */
    public static function batchUpdate(array $ids, array $data, int $chunkSize = 500)
    {
        if (empty($ids)) {
            return 0;
        }

        $updated = 0;
        $chunks = array_chunk($ids, $chunkSize);

        foreach ($chunks as $chunk) {
            $updated += static::whereIn((new static)->getKeyName(), $chunk)->update($data);
        }

        return $updated;
    }

    /**
     * Efficient count with caching
     */
    public static function cachedCount(string $cacheKey = null, callable $queryModifier = null)
    {
        $key = $cacheKey ?? static::class . '_count';
        
        return Cache::remember($key, static::$cacheDurations['count'], function () use ($queryModifier) {
            $query = static::query();
            
            if ($queryModifier) {
                $queryModifier($query);
            }
            
            return $query->count();
        });
    }

    /**
     * Clear model-specific cache
     */
    public static function clearModelCache()
    {
        $table = (new static)->getTable();
        $patterns = [
            "query_{$table}_*",
            static::class . '_*',
            "{$table}_*",
        ];

        // For file/array cache, we need to clear specific keys
        // For Redis, we could use pattern matching
        Cache::flush();
    }

    /**
     * Get statistics with caching
     */
    public static function getStatistics(array $statConfig = [])
    {
        $cacheKey = static::class . '_statistics_' . md5(serialize($statConfig));
        
        return Cache::remember($cacheKey, static::$cacheDurations['stats'], function () use ($statConfig) {
            $stats = [];
            
            foreach ($statConfig as $name => $config) {
                $query = static::query();
                
                // Apply conditions
                if (isset($config['where'])) {
                    foreach ($config['where'] as $column => $value) {
                        $query->where($column, $value);
                    }
                }
                
                // Apply aggregate
                $aggregate = $config['aggregate'] ?? 'count';
                $column = $config['column'] ?? '*';
                
                switch ($aggregate) {
                    case 'sum':
                        $stats[$name] = $query->sum($column);
                        break;
                    case 'avg':
                        $stats[$name] = $query->avg($column);
                        break;
                    case 'max':
                        $stats[$name] = $query->max($column);
                        break;
                    case 'min':
                        $stats[$name] = $query->min($column);
                        break;
                    default:
                        $stats[$name] = $query->count();
                }
            }
            
            return $stats;
        });
    }

    /**
     * Search with relevance scoring
     */
    public static function searchWithRelevance(string $searchTerm, array $searchableColumns, int $limit = 50)
    {
        if (empty($searchTerm) || empty($searchableColumns)) {
            return collect([]);
        }

        $query = static::query();
        $term = '%' . $searchTerm . '%';

        // Build search conditions with relevance scoring
        $query->where(function ($q) use ($searchableColumns, $term) {
            foreach ($searchableColumns as $column) {
                $q->orWhere($column, 'LIKE', $term);
            }
        });

        // Add relevance ordering (exact matches first)
        $query->orderByRaw(
            "CASE WHEN " . $searchableColumns[0] . " LIKE ? THEN 1 " .
            "WHEN " . $searchableColumns[0] . " LIKE ? THEN 2 " .
            "ELSE 3 END",
            [$searchTerm, $searchTerm . '%']
        );

        return $query->limit($limit)->get();
    }
}

