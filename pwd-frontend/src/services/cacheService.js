// API Response Caching Service
class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxAge = {
      // Short cache for frequently changing data
      dashboard: 30 * 1000, // 30 seconds
      announcements: 5 * 60 * 1000, // 5 minutes
      applications: 2 * 60 * 1000, // 2 minutes
      // Medium cache for moderately changing data
      pwdMembers: 10 * 60 * 1000, // 10 minutes
      documents: 15 * 60 * 1000, // 15 minutes
      // Long cache for rarely changing data
      documentTypes: 60 * 60 * 1000, // 1 hour
      benefits: 30 * 60 * 1000, // 30 minutes
      // Default
      default: 5 * 60 * 1000, // 5 minutes
    };
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
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache data
   */
  set(key, data, maxAge = null) {
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
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge: maxAge || cacheMaxAge,
    });
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

