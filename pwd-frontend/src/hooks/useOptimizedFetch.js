/**
 * Optimized Data Fetching Hook
 * Provides efficient data fetching with caching, deduplication, and pagination
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { api } from '../services/api';
import { cacheService } from '../services/cacheService';

/**
 * Hook for optimized data fetching with automatic caching and deduplication
 */
export function useOptimizedFetch(endpoint, options = {}) {
  const {
    enabled = true,
    cacheDuration = null,
    skipCache = false,
    initialData = null,
    onSuccess = null,
    onError = null,
    dependencies = [],
    transform = null, // Transform function for data
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (skipCacheOverride = false) => {
    if (!enabled || !endpoint) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(endpoint, {
        skipCache: skipCache || skipCacheOverride,
        cacheDuration,
      });

      if (!isMountedRef.current) return;

      const transformedData = transform ? transform(response) : response;
      setData(transformedData);
      
      if (onSuccess) {
        onSuccess(transformedData);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err.name === 'AbortError') return;
      
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [endpoint, enabled, skipCache, cacheDuration, transform, onSuccess, onError]);

  // Initial fetch and refetch on dependencies change
  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [endpoint, ...dependencies]);

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Hook for paginated data fetching
 */
export function usePaginatedFetch(endpoint, options = {}) {
  const {
    pageSize = 20,
    initialPage = 1,
    transform = null,
    enabled = true,
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async (pageNum) => {
    if (!enabled || !endpoint) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`${endpoint}?page=${pageNum}&per_page=${pageSize}`, {
        skipCache: true,
      });

      const items = response.data || response;
      const transformedData = transform ? items.map(transform) : items;
      
      setData(transformedData);
      setTotalPages(response.last_page || Math.ceil((response.total || items.length) / pageSize));
      setTotalItems(response.total || items.length);
      setPage(pageNum);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, pageSize, transform, enabled]);

  useEffect(() => {
    fetchPage(initialPage);
  }, [endpoint]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      fetchPage(page + 1);
    }
  }, [page, totalPages, fetchPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      fetchPage(page - 1);
    }
  }, [page, fetchPage]);

  const goToPage = useCallback((pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      fetchPage(pageNum);
    }
  }, [totalPages, fetchPage]);

  return {
    data,
    page,
    totalPages,
    totalItems,
    loading,
    error,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => fetchPage(page),
  };
}

/**
 * Hook for infinite scroll data fetching
 */
export function useInfiniteScroll(endpoint, options = {}) {
  const {
    pageSize = 20,
    threshold = 100, // pixels from bottom
    transform = null,
    enabled = true,
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (!enabled || loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`${endpoint}?page=${page}&per_page=${pageSize}`, {
        skipCache: true,
      });

      const items = response.data || response;
      const transformedData = transform ? items.map(transform) : items;
      
      setData(prev => [...prev, ...transformedData]);
      setHasMore(items.length === pageSize);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, transform, enabled, loading, hasMore]);

  // Set up intersection observer for infinite scroll
  const lastElementRef = useCallback((node) => {
    if (loading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { rootMargin: `${threshold}px` });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, loadMore, threshold]);

  // Initial load
  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, [endpoint]);

  useEffect(() => {
    if (page === 1 && hasMore) {
      loadMore();
    }
  }, [endpoint]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    lastElementRef,
    loadMore,
    reset,
  };
}

/**
 * Hook for debounced search
 */
export function useDebouncedSearch(endpoint, options = {}) {
  const {
    debounceMs = 300,
    minLength = 2,
    transform = null,
  } = options;

  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const abortRef = useRef(null);

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < minLength) {
      setData([]);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`${endpoint}?search=${encodeURIComponent(searchQuery)}`, {
        skipCache: true,
      });

      const items = response.data || response;
      const transformedData = transform ? items.map(transform) : items;
      setData(transformedData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, minLength, transform]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      search(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs, search]);

  return {
    query,
    setQuery,
    data,
    loading,
    error,
    search: (q) => {
      setQuery(q);
      search(q);
    },
  };
}

export default useOptimizedFetch;

