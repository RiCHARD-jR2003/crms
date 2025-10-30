<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;

class CacheHelper
{
    /**
     * Cache TTL constants (in minutes)
     */
    const SHORT_CACHE = 5;      // 5 minutes - for frequently changing data
    const MEDIUM_CACHE = 15;   // 15 minutes - for moderately changing data
    const LONG_CACHE = 60;      // 60 minutes - for rarely changing data
    const VERY_LONG_CACHE = 1440; // 24 hours - for static/reference data

    /**
     * Get cached data or store if not exists
     *
     * @param string $key
     * @param callable $callback
     * @param int $ttl
     * @return mixed
     */
    public static function remember($key, $callback, $ttl = self::MEDIUM_CACHE)
    {
        return Cache::remember($key, now()->addMinutes($ttl), $callback);
    }

    /**
     * Cache dashboard statistics
     */
    public static function getDashboardStats($role = null)
    {
        $key = 'dashboard_stats' . ($role ? "_$role" : '');
        return self::remember($key, function() {
            return app(\App\Http\Controllers\DashboardController::class)->getDashboardStats()->getData();
        }, self::SHORT_CACHE);
    }

    /**
     * Cache announcements
     */
    public static function getAnnouncements($role = null)
    {
        $key = 'announcements' . ($role ? "_$role" : '');
        return self::remember($key, function() use ($role) {
            $controller = app(\App\Http\Controllers\API\AnnouncementController::class);
            return $controller->index(request());
        }, self::MEDIUM_CACHE);
    }

    /**
     * Clear all dashboard related caches
     */
    public static function clearDashboardCache()
    {
        Cache::forget('dashboard_stats');
        Cache::forget('dashboard_stats_admin');
        Cache::forget('dashboard_stats_superadmin');
        Cache::forget('dashboard_stats_pwdmember');
        Cache::forget('dashboard_stats_barangaypresident');
        Cache::forget('dashboard_stats_frontdesk');
    }

    /**
     * Clear announcements cache
     */
    public static function clearAnnouncementsCache()
    {
        $roles = ['', '_admin', '_superadmin', '_pwdmember', '_barangaypresident', '_frontdesk'];
        foreach ($roles as $role) {
            Cache::forget('announcements' . $role);
        }
    }

    /**
     * Clear all caches
     */
    public static function clearAll()
    {
        Cache::flush();
    }
}

