/**
 * Lazy Loading and Code Splitting Utilities
 * Optimizes application performance by implementing lazy loading, prefetching, and prerendering
 */

import { lazy } from 'react';
import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Loading fallback component
export const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="60vh"
    sx={{ 
      backgroundColor: '#f8f9fa',
      borderRadius: 2
    }}
  >
    <CircularProgress 
      size={60} 
      thickness={4}
      sx={{ 
        color: '#0b87ac',
        animationDuration: '1000ms'
      }} 
    />
  </Box>
);

// Wrapper for lazy-loaded components with Suspense
export const LazyComponent = ({ 
  children, 
  fallback = <LoadingFallback /> 
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Prefetch helper for resources
export const prefetchResource = (url, options = {}) => {
  const {
    as = 'script',
    type = 'text/javascript',
    onload,
    onerror,
  } = options;

  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`link[href="${url}"]`)) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = as;
    link.type = type;

    if (onload) link.onload = onload;
    if (onerror) link.onerror = onerror;

    link.onload = () => {
      resolve();
    };

    link.onerror = () => {
      reject(new Error(`Failed to prefetch resource: ${url}`));
    };

    document.head.appendChild(link);
  });
};

// Preload helper for critical resources
export const preloadResource = (url, options = {}) => {
  const {
    as = 'script',
    type = 'text/javascript',
    crossorigin = false,
  } = options;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  link.type = type;
  
  if (crossorigin) {
    link.crossOrigin = crossorigin;
  }

  document.head.appendChild(link);
};

// DNS prefetch for external resources
export const dnsPrefetch = (url) => {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = url;
  document.head.appendChild(link);
};

// Prerender helper
export const prerenderPage = (url) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const link = document.createElement('link');
      link.rel = 'prerender';
      link.href = url;
      document.head.appendChild(link);
    });
  }
};

// Preconnect to important origins
export const preconnect = (url, options = {}) => {
  const { crossorigin = 'anonymous' } = options;
  
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  link.crossOrigin = crossorigin;
  
  document.head.appendChild(link);
};

// Batch prefetch multiple resources
export const batchPrefetch = (urls, options = {}) => {
  return Promise.all(
    urls.map(url => prefetchResource(url, options))
  );
};

// Intelligent prefetching based on user behavior
export const smartPrefetch = (probability, url) => {
  // Only prefetch if probability is high enough
  if (Math.random() > 1 - probability) {
    return prefetchResource(url);
  }
};

export default {
  prefetchResource,
  preloadResource,
  dnsPrefetch,
  prerenderPage,
  preconnect,
  batchPrefetch,
  smartPrefetch,
};

