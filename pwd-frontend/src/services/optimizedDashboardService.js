/**
 * Optimized Dashboard Service
 * Provides efficient data fetching for dashboard components with parallel loading
 */

import { api } from './api';
import { cacheService } from './cacheService';

// Dashboard data cache keys
const CACHE_KEYS = {
  stats: 'dashboard_stats',
  recentApplications: 'dashboard_recent_applications',
  recentAnnouncements: 'dashboard_recent_announcements',
  activities: 'dashboard_activities',
  memberStats: 'dashboard_member_stats',
};

/**
 * Fetch all dashboard data in parallel for faster loading
 */
export async function fetchDashboardData(options = {}) {
  const {
    role = null,
    barangay = null,
    skipCache = false,
  } = options;

  // Build cache key based on role and barangay
  const cacheKey = `dashboard_data_${role}_${barangay}`;
  
  // Check cache first
  if (!skipCache) {
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch all data in parallel
  const promises = [
    fetchDashboardStats(role, barangay),
    fetchRecentApplications(role, barangay, 5),
    fetchRecentAnnouncements(barangay, 3),
  ];

  try {
    const [stats, recentApplications, recentAnnouncements] = await Promise.all(promises);
    
    const dashboardData = {
      stats,
      recentApplications,
      recentAnnouncements,
      fetchedAt: new Date().toISOString(),
    };

    // Cache the combined result
    cacheService.set(cacheKey, dashboardData, 60000); // 1 minute cache

    return dashboardData;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Fetch dashboard statistics
 */
async function fetchDashboardStats(role, barangay) {
  const params = new URLSearchParams();
  if (barangay) params.append('barangay', barangay);
  
  try {
    const response = await api.get(`/dashboard-stats?${params}`, { 
      cacheDuration: 60000 // 1 minute
    });
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalPWDMembers: 0,
      pendingApplications: 0,
      approvedApplications: 0,
      activeMembers: 0,
    };
  }
}

/**
 * Fetch recent applications
 */
async function fetchRecentApplications(role, barangay, limit = 5) {
  const params = new URLSearchParams();
  params.append('limit', limit);
  params.append('recent', 'true');
  if (barangay) params.append('barangay', barangay);
  
  try {
    const response = await api.get(`/applications?${params}`, {
      cacheDuration: 60000 // 1 minute
    });
    
    // Handle different response formats
    const applications = Array.isArray(response) ? response : (response?.data || []);
    return applications.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    return [];
  }
}

/**
 * Fetch recent announcements
 */
async function fetchRecentAnnouncements(barangay, limit = 3) {
  try {
    const endpoint = barangay 
      ? `/announcements/audience/${encodeURIComponent(barangay)}`
      : '/announcements';
    
    const response = await api.get(endpoint, {
      cacheDuration: 120000 // 2 minutes
    });
    
    const announcements = Array.isArray(response) ? response : (response?.data || []);
    
    // Filter to active only and limit
    return announcements
      .filter(a => a.status === 'Active')
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent announcements:', error);
    return [];
  }
}

/**
 * Prefetch dashboard data (call on route hover or anticipation)
 */
export function prefetchDashboardData(role, barangay) {
  // Use requestIdleCallback for non-blocking prefetch
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      fetchDashboardData({ role, barangay }).catch(() => {});
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      fetchDashboardData({ role, barangay }).catch(() => {});
    }, 100);
  }
}

/**
 * Fetch member statistics for admin dashboard
 */
export async function fetchMemberStatistics(barangay = null) {
  const cacheKey = `member_stats_${barangay}`;
  
  const cached = cacheService.get(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    if (barangay) params.append('barangay', barangay);
    
    const response = await api.get(`/pwd-members/statistics?${params}`);
    
    cacheService.set(cacheKey, response, 300000); // 5 minute cache
    return response;
  } catch (error) {
    console.error('Error fetching member statistics:', error);
    return null;
  }
}

/**
 * Batch fetch for multiple dashboard widgets
 */
export async function fetchDashboardWidgets(widgets = []) {
  const results = {};
  
  // Map widget names to fetch functions
  const widgetFetchers = {
    stats: () => fetchDashboardStats(null, null),
    recentApplications: () => fetchRecentApplications(null, null, 5),
    recentAnnouncements: () => fetchRecentAnnouncements(null, 3),
    memberStats: () => fetchMemberStatistics(),
  };

  // Fetch only requested widgets in parallel
  const promises = widgets
    .filter(w => widgetFetchers[w])
    .map(async (widget) => {
      try {
        results[widget] = await widgetFetchers[widget]();
      } catch (error) {
        console.error(`Error fetching ${widget}:`, error);
        results[widget] = null;
      }
    });

  await Promise.all(promises);
  return results;
}

/**
 * Subscribe to real-time dashboard updates (placeholder for WebSocket)
 */
export function subscribeToDashboardUpdates(callback) {
  // Placeholder for WebSocket implementation
  // For now, poll every 30 seconds
  const intervalId = setInterval(async () => {
    try {
      const data = await fetchDashboardData({ skipCache: true });
      callback(data);
    } catch (error) {
      console.error('Error in dashboard update:', error);
    }
  }, 30000);

  return () => clearInterval(intervalId);
}

export default {
  fetchDashboardData,
  fetchDashboardStats,
  fetchRecentApplications,
  fetchRecentAnnouncements,
  prefetchDashboardData,
  fetchMemberStatistics,
  fetchDashboardWidgets,
  subscribeToDashboardUpdates,
};

