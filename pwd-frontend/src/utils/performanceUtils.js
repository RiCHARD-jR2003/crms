/**
 * Performance Utilities
 * Functions for optimizing React component performance
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Custom hook for debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttled callback
 */
export function useThrottle(callback, delay = 300) {
  const lastCall = useRef(0);
  const lastArgs = useRef(null);
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();
    lastArgs.current = args;

    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
      // Schedule a trailing call
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...lastArgs.current);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay]);
}

/**
 * Custom hook for memoized expensive computations
 */
export function useMemoizedValue(computeFn, deps = [], options = {}) {
  const { cacheKey = null, maxAge = 300000 } = options; // 5 min default
  const cacheRef = useRef({ value: null, timestamp: 0, key: null });

  return useMemo(() => {
    const now = Date.now();
    const cache = cacheRef.current;

    // Check if cached value is still valid
    if (
      cache.key === cacheKey &&
      cache.value !== null &&
      (now - cache.timestamp) < maxAge
    ) {
      return cache.value;
    }

    // Compute new value
    const newValue = computeFn();
    cacheRef.current = { value: newValue, timestamp: now, key: cacheKey };
    return newValue;
  }, [...deps, cacheKey]);
}

/**
 * Custom hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef(null);

  const { threshold = 0.1, rootMargin = '50px', once = true } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        
        if (visible) {
          setHasBeenVisible(true);
          if (once) {
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible, hasBeenVisible };
}

/**
 * Custom hook for virtual scrolling
 */
export function useVirtualScroll(items, options = {}) {
  const {
    itemHeight = 50,
    overscan = 5,
    containerHeight = 400,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      offsetTop: startIndex * itemHeight,
      totalHeight: items.length * itemHeight,
    };
  }, [items, scrollTop, itemHeight, overscan, containerHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    containerRef,
    handleScroll,
    ...visibleItems,
  };
}

/**
 * Measure component render time (development only)
 */
export function useRenderTime(componentName) {
  const startTime = useRef(performance.now());

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      if (renderTime > 16) { // More than one frame
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    }
  });
}

/**
 * Prevent unnecessary re-renders by deep comparing objects
 */
export function useDeepMemo(value, compareFn = null) {
  const ref = useRef(value);

  const areEqual = compareFn 
    ? compareFn(ref.current, value)
    : JSON.stringify(ref.current) === JSON.stringify(value);

  if (!areEqual) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Stable callback that doesn't change reference
 */
export function useStableCallback(callback) {
  const ref = useRef(callback);
  ref.current = callback;

  return useCallback((...args) => {
    return ref.current(...args);
  }, []);
}

/**
 * Request idle callback wrapper
 */
export function scheduleIdleTask(callback, options = {}) {
  const { timeout = 2000 } = options;

  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, { timeout });
  } else {
    return setTimeout(callback, 1);
  }
}

/**
 * Cancel idle task
 */
export function cancelIdleTask(id) {
  if ('cancelIdleCallback' in window) {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Batch state updates for better performance
 */
export function batchUpdates(updates) {
  // React 18+ automatically batches updates
  // This is a fallback for older versions
  if (typeof window !== 'undefined' && window.ReactDOM?.unstable_batchedUpdates) {
    window.ReactDOM.unstable_batchedUpdates(() => {
      updates();
    });
  } else {
    updates();
  }
}

/**
 * Memoize function results
 */
export function memoize(fn, options = {}) {
  const { maxSize = 100 } = options;
  const cache = new Map();
  const keyOrder = [];

  return function memoized(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    
    // Evict oldest if at max size
    if (cache.size >= maxSize) {
      const oldestKey = keyOrder.shift();
      cache.delete(oldestKey);
    }

    cache.set(key, result);
    keyOrder.push(key);
    
    return result;
  };
}

/**
 * Optimize table data for rendering
 */
export function optimizeTableData(data, options = {}) {
  const { maxRows = 100, columns = null } = options;

  // Limit rows
  const limitedData = data.slice(0, maxRows);

  // Select only needed columns
  if (columns && columns.length > 0) {
    return limitedData.map(row => {
      const optimizedRow = {};
      columns.forEach(col => {
        if (row.hasOwnProperty(col)) {
          optimizedRow[col] = row[col];
        }
      });
      return optimizedRow;
    });
  }

  return limitedData;
}

/**
 * Format large numbers efficiently
 */
export const formatNumber = memoize((num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
});

/**
 * Format date efficiently - Always returns MM/DD/YYYY format
 */
export const formatDate = memoize((dateString, format = 'short') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  // Always format as MM/DD/YYYY regardless of format parameter
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
});

export default {
  useDebounce,
  useThrottle,
  useMemoizedValue,
  useIntersectionObserver,
  useVirtualScroll,
  useRenderTime,
  useDeepMemo,
  useStableCallback,
  scheduleIdleTask,
  cancelIdleTask,
  batchUpdates,
  memoize,
  optimizeTableData,
  formatNumber,
  formatDate,
};

