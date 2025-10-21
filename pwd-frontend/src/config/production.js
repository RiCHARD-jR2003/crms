// Production API Configuration
// Update these URLs to match your Hostinger domain

const PRODUCTION_CONFIG = {
  // Updated for Hostinger temporary domain
  API_BASE_URL: 'https://lightgoldenrodyellow-ibis-644404.hostingersite.com/api',
  STORAGE_BASE_URL: 'https://lightgoldenrodyellow-ibis-644404.hostingersite.com',
  
  // Example configurations for different domains:
  // API_BASE_URL: 'https://pwdmanagement.yourdomain.com/api',
  // STORAGE_BASE_URL: 'https://pwdmanagement.yourdomain.com',
  
  // Or if using subdirectories:
  // API_BASE_URL: 'https://yourdomain.com/pwd-backend/api',
  // STORAGE_BASE_URL: 'https://yourdomain.com/pwd-backend',
};

// Network Development Configuration (accessible from other PCs)
const NETWORK_CONFIG = {
  API_BASE_URL: 'http://192.168.0.126:8000/api',
  STORAGE_BASE_URL: 'http://192.168.0.126:8000',
};

// Development Configuration (localhost only)
const DEVELOPMENT_CONFIG = {
  API_BASE_URL: 'http://127.0.0.1:8000/api',
  STORAGE_BASE_URL: 'http://127.0.0.1:8000',
};

// Export development configuration for local testing
export const API_CONFIG = DEVELOPMENT_CONFIG;

// Instructions for updating:
// 1. Replace 'yourdomain.com' with your actual Hostinger domain
// 2. If using subdirectories, adjust the paths accordingly
// 3. Make sure your Laravel backend is accessible at the API_BASE_URL
// 4. Test the configuration before deploying
