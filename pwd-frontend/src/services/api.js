// src/services/api.js

// Import production configuration
import { API_CONFIG } from '../config/production';

// Use environment-appropriate configuration
const API_BASE_URL = API_CONFIG.API_BASE_URL;
const STORAGE_BASE_URL = API_CONFIG.STORAGE_BASE_URL;

async function getStoredToken() {
  try {
    const raw = localStorage.getItem('auth.token');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    localStorage.removeItem('auth.token');
    return null;
  }
}

function isFormData(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function request(path, { method = 'GET', headers = {}, body, auth = true } = {}) {
  const token = auth ? await getStoredToken() : null;

  const finalHeaders = { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers };

  // If sending FormData, let React Native handle the Content-Type
  const usingFormData = isFormData(body);
  if (!usingFormData && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (usingFormData && finalHeaders['Content-Type']) {
    // Remove any manually set content type for FormData
    delete finalHeaders['Content-Type'];
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: usingFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    
    if (!res.ok) {
      const error = new Error((data && data.message) || res.statusText);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    
    return data;
    
  } catch (error) {
    console.error(`Failed with URL ${API_BASE_URL}${path}:`, error.message);
    throw error;
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  setToken: (token) => localStorage.setItem('auth.token', JSON.stringify(token)),
  clearToken: () => localStorage.removeItem('auth.token'),
  getStorageUrl: (path) => `${STORAGE_BASE_URL}/storage/${path}`,
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
};

export default api;
