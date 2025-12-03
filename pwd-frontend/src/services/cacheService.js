// API Response Caching Service with LRU eviction
class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxEntries = 200; // Maximum cache entries
    this.accessOrder = []; // Track access order for LRU
    this.maxAge = {
      // Short cache for frequently changing data
      dashboard: 30 * 1000, // 30 seconds
      announcements: 2 * 60 * 1000, // 2 minutes
      applications: 60 * 1000, // 1 minute
      // Medium cache for moderately changing data
      pwdMembers: 5 * 60 * 1000, // 5 minutes
      documents: 10 * 60 * 1000, // 10 minutes
      // Long cache for rarely changing data
      documentTypes: 60 * 60 * 1000, // 1 hour
      benefits: 5 * 60 * 1000, // 5 minutes
      statistics: 5 * 60 * 1000, // 5 minutes
      barangays: 60 * 60 * 1000, // 1 hour (static data)
      // Default
      default: 2 * 60 * 1000, // 2 minutes
    };
  }

  /**
   * Track access for LRU eviction
   */
  trackAccess(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used entries if cache is full
   */
  evictIfNeeded() {
    while (this.cache.size >= this.maxEntries && this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Generate cache key from URL and params
   */
  getCacheKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${url}${sortedParams ? `?${sortedParams}` : ''}`;
  }

  /**
   * Get cached data if valid
   */
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.maxAge) {
      this.cache.delete(key);
      // Remove from access order
      const index = this.accessOrder.indexOf(key);
      if (index > -1) this.accessOrder.splice(index, 1);
      return null;
    }

    // Track access for LRU
    this.trackAccess(key);
    return cached.data;
  }

  /**
   * Set cache data with LRU eviction
   */
  set(key, data, maxAge = null) {
    // Evict old entries if needed
    this.evictIfNeeded();

    // Determine cache duration based on URL pattern
    let cacheMaxAge = maxAge || this.maxAge.default;
    
    if (key.includes('/dashboard')) {
      cacheMaxAge = this.maxAge.dashboard;
    } else if (key.includes('/announcements')) {
      cacheMaxAge = this.maxAge.announcements;
    } else if (key.includes('/applications')) {
      cacheMaxAge = this.maxAge.applications;
    } else if (key.includes('/pwd-members')) {
      cacheMaxAge = this.maxAge.pwdMembers;
    } else if (key.includes('/documents')) {
      cacheMaxAge = this.maxAge.documents;
    } else if (key.includes('/document-types')) {
      cacheMaxAge = this.maxAge.documentTypes;
    } else if (key.includes('/benefits')) {
      cacheMaxAge = this.maxAge.benefits;
    } else if (key.includes('/statistics') || key.includes('/stats')) {
      cacheMaxAge = this.maxAge.statistics;
    } else if (key.includes('/barangays')) {
      cacheMaxAge = this.maxAge.barangays;
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge: maxAge || cacheMaxAge,
    });

    // Track access for LRU
    this.trackAccess(key);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidate(pattern) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheService = new CacheService();

