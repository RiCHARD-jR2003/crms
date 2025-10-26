/**
 * Resource Prefetcher Component
 * Implements intelligent prefetching, preloading, and prerendering for optimal performance
 */

import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { prefetchResource, preloadResource, dnsPrefetch, preconnect, prerenderPage } from '../../utils/lazyLoading';

const ResourcePrefetcher = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Preconnect to important origins
  useEffect(() => {
    // Preconnect to API endpoints
    preconnect(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api`);
    
    // DNS prefetch for external CDNs
    dnsPrefetch('https://fonts.googleapis.com');
    dnsPrefetch('https://fonts.gstatic.com');
    dnsPrefetch('https://maps.googleapis.com');
    
    // Preconnect with credentials for authenticated requests
    preconnect(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}`, {
      crossorigin: 'include'
    });
  }, []);

  // Prefetch critical pages based on current location
  const prefetchCriticalPages = useCallback(() => {
    const criticalPages = [
      '/login',
      '/register',
      '/dashboard',
    ];

    // Prefetch critical pages in the background
    criticalPages.forEach(page => {
      if (page !== location.pathname) {
        // Use requestIdleCallback for non-blocking prefetching
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            fetch(page).catch(() => {}); // Silently fail
          });
        }
      }
    });
  }, [location.pathname]);

  // Prefetch based on user role
  const prefetchRoleBasedPages = useCallback(() => {
    // Get user role from localStorage or context
    const userRole = localStorage.getItem('userRole');
    const rolePages = {
      'Admin': ['/pwd-masterlist', '/pwd-cards', '/reports', '/admin-announcements'],
      'Staff1': ['/pwd-masterlist', '/pwd-records'],
      'Staff2': ['/staff2-ayuda', '/staff2-benefit-tracking'],
      'FrontDesk': ['/frontdesk-pwd-card', '/frontdesk-support'],
      'PWDMember': ['/pwd-profile', '/member-support'],
      'BarangayPresident': ['/president-records', '/president-ayuda'],
    };

    if (userRole && rolePages[userRole]) {
      rolePages[userRole].forEach(page => {
        // Prerender frequently accessed pages
        if (['/pwd-masterlist', '/pwd-profile', '/pwd-records'].includes(page)) {
          prerenderPage(page);
        } else {
          // Prefetch other pages
          prefetchResource(page);
        }
      });
    }
  }, []);

  // Prefetch images on page load
  const prefetchImages = useCallback(() => {
    const imageUrls = [
      '/images/cropped_image.png',
      '/logo192.png',
      '/logo512.png',
    ];

    imageUrls.forEach(url => {
      // Only prefetch if image is not already loaded
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Smart prefetching on hover
  const handleLinkHover = useCallback((url) => {
    // Prefetch when user hovers over a link (indicating intent)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchResource(url);
      }, { timeout: 2000 });
    }
  }, []);

  // Debounce function for performance
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Track route changes and prefetch next likely routes
  const predictNextRoute = useCallback((currentPath) => {
    const routeMap = {
      '/login': '/dashboard',
      '/register': '/login',
      '/dashboard': ['/pwd-masterlist', '/pwd-cards', '/reports'],
      '/pwd-masterlist': ['/pwd-records', '/pwd-cards'],
      '/pwd-records': ['/pwd-masterlist', '/reports'],
    };

    const predictedRoutes = routeMap[currentPath];
    if (predictedRoutes) {
      const routesArray = Array.isArray(predictedRoutes) ? predictedRoutes : [predictedRoutes];
      routesArray.forEach(route => {
        if (route !== currentPath) {
          setTimeout(() => prefetchResource(route), 100);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Prefetch critical resources on mount
    prefetchCriticalPages();
    prefetchRoleBasedPages();
    prefetchImages();
    predictNextRoute(location.pathname);
  }, [location.pathname, prefetchCriticalPages, prefetchRoleBasedPages, prefetchImages, predictNextRoute]);

  // Add global prefetching on link hover
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="/"]');
    
    const handleMouseEnter = (e) => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('/')) {
        handleLinkHover(href);
      }
    };

    links.forEach(link => {
      link.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, [location.pathname, handleLinkHover]);

  return null; // This component doesn't render anything
};

export default ResourcePrefetcher;

