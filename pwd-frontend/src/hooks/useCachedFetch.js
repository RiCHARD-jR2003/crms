import { useState, useEffect, useRef } from 'react';
import { cacheService } from '../services/cacheService';

/**
 * Custom hook for cached API fetching
 * Automatically caches responses and handles loading/error states
 */
export function useCachedFetch(url, options = {}) {
  const {
    cacheKey = null,
    cacheDuration = null,
    skipCache = false,
    dependencies = [],
    ...fetchOptions
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancel previous request if component unmounts or dependencies change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate cache key
        const key = cacheKey || cacheService.getCacheKey(url, fetchOptions);

        // Check cache first (unless skipCache is true)
        if (!skipCache) {
          const cached = cacheService.get(key);
          if (cached) {
            setData(cached);
            setLoading(false);
            return;
          }
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        // Fetch from API
        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Cache the result
        if (!skipCache) {
          cacheService.set(key, result, cacheDuration);
        }

        setData(result);
      } catch (err) {
        if (err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, JSON.stringify(fetchOptions), ...dependencies]);

  return { data, loading, error };
}

