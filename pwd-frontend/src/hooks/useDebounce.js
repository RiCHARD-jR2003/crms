import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * Useful for search inputs, API calls, etc.
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
 * Custom hook for throttling function calls
 */
export function useThrottle(func, delay = 300) {
  const [lastRan, setLastRan] = useState(Date.now());

  return function(...args) {
    const now = Date.now();
    if (now - lastRan >= delay) {
      setLastRan(now);
      return func(...args);
    }
  };
}

