// src/services/api.js

// Import production configuration
import { API_CONFIG } from '../config/production';
import { cacheService } from './cacheService';

// Use environment-appropriate configuration
const API_BASE_URL = API_CONFIG.API_BASE_URL;
const STORAGE_BASE_URL = API_CONFIG.STORAGE_BASE_URL;

async function getStoredToken() {
  try {
    const raw = localStorage.getItem('auth.token');
    if (!raw) return null;
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(raw);
      // If it's already a string, return it directly
      // If it's an object with a token property, extract it
      if (typeof parsed === 'string') {
        return parsed;
      } else if (parsed && parsed.token) {
        return parsed.token;
      } else if (parsed && typeof parsed === 'object') {
        return parsed;
      }
      return parsed;
    } catch (e) {
      // If parsing fails, treat it as a plain string token
      return raw;
    }
  } catch (_) {
    localStorage.removeItem('auth.token');
    return null;
  }
}

function isFormData(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

// Request queue to prevent duplicate simultaneous requests
const pendingRequests = new Map();

async function request(path, { method = 'GET', headers = {}, body, auth = true, skipCache = false, cacheDuration = null } = {}) {
  const token = auth ? await getStoredToken() : null;
  
  // Ensure token is a string for Authorization header
  let tokenString = null;
  if (token) {
    if (typeof token === 'string') {
      tokenString = token;
    } else if (token && token.token) {
      tokenString = token.token;
    } else if (token && typeof token === 'object') {
      // Try to stringify if it's an object
      tokenString = JSON.stringify(token);
    }
  }

  const finalHeaders = { ...(tokenString ? { Authorization: `Bearer ${tokenString}` } : {}), ...headers };

  // If sending FormData, let React Native handle the Content-Type
  const usingFormData = isFormData(body);
  if (!usingFormData && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (usingFormData && finalHeaders['Content-Type']) {
    // Remove any manually set content type for FormData
    delete finalHeaders['Content-Type'];
  }

  // For GET requests, check cache first
  if (method === 'GET' && !skipCache) {
    const cacheKey = cacheService.getCacheKey(path, { headers: finalHeaders });
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if same request is already pending
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
  }

  // Create AbortController for timeout handling (especially important for mobile)
  const controller = new AbortController();
  let timeoutId = null;
  
  // Create request promise
  const requestPromise = (async () => {
    try {
      timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout for large file uploads
      
      const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: finalHeaders,
        body: usingFormData ? body : body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      
      if (timeoutId) clearTimeout(timeoutId);

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
      
      if (!res.ok) {
        const error = new Error((data && data.message) || res.statusText);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      
      // Cache successful GET responses
      if (method === 'GET' && !skipCache) {
        const cacheKey = cacheService.getCacheKey(path, { headers: finalHeaders });
        cacheService.set(cacheKey, data, cacheDuration);
        pendingRequests.delete(cacheKey);
      }
      
      return data;
      
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Remove from pending requests on error
      if (method === 'GET' && !skipCache) {
        const cacheKey = cacheService.getCacheKey(path, { headers: finalHeaders });
        pendingRequests.delete(cacheKey);
      }
      
      console.error(`Failed with URL ${API_BASE_URL}${path}:`, error.message);
      
      // Provide more specific error messages for mobile
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timed out. The file upload may be too large or your connection is slow. Please try again with a smaller file or better connection.');
        timeoutError.status = 408;
        throw timeoutError;
      }
      
      if (error.message && error.message.includes('Failed to fetch')) {
        const networkError = new Error('Network error. Please check your internet connection and try again.');
        networkError.status = 0;
        throw networkError;
      }
      
      throw error;
    }
  })();

  // For GET requests, store promise to prevent duplicates
  if (method === 'GET' && !skipCache) {
    const cacheKey = cacheService.getCacheKey(path, { headers: finalHeaders });
    pendingRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => {
    // Invalidate related cache on POST
    if (path.includes('/applications')) {
      cacheService.invalidate('/applications');
      cacheService.invalidate('/dashboard');
    } else if (path.includes('/support-tickets')) {
      cacheService.invalidate('/support-tickets');
    }
    return request(path, { ...opts, method: 'POST', body });
  },
  put: (path, body, opts) => {
    // Invalidate related cache on PUT
    cacheService.invalidate(path.split('/')[0]);
    return request(path, { ...opts, method: 'PUT', body });
  },
  patch: (path, body, opts) => {
    // Invalidate related cache on PATCH
    cacheService.invalidate(path.split('/')[0]);
    return request(path, { ...opts, method: 'PATCH', body });
  },
  delete: (path, opts) => {
    // Invalidate related cache on DELETE
    cacheService.invalidate(path.split('/')[0]);
    return request(path, { ...opts, method: 'DELETE' });
  },
  setToken: (token) => localStorage.setItem('auth.token', JSON.stringify(token)),
  clearToken: () => {
    localStorage.removeItem('auth.token');
    cacheService.clear(); // Clear cache on logout
  },
  getStorageUrl: (path) => `${STORAGE_BASE_URL}/storage/${path}`,
  getBaseUrl: () => API_BASE_URL,
  getFilePreviewUrl: (type, id, fileType = null) => {
    const baseUrl = API_BASE_URL;
    switch (type) {
      case 'support-ticket':
        return `${baseUrl}/support-tickets/messages/${id}/download`;
      case 'application-file':
        return `${baseUrl}/application-file/${id}/${fileType}`;
      case 'document-file':
        return `${baseUrl}/documents/file/${id}`;
      default:
        return null;
    }
  },
  // Cache management methods
  invalidateCache: (pattern) => cacheService.invalidate(pattern),
  clearCache: () => cacheService.clear(),
  getCacheStats: () => cacheService.getStats(),
};

export default api;
