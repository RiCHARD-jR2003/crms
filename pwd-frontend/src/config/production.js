// Production API Configuration
// Update these URLs to match your Hostinger domain

const PRODUCTION_CONFIG = {
  // Replace 'yourdomain.com' with your actual domain
  API_BASE_URL: 'https://yourdomain.com/api',
  STORAGE_BASE_URL: 'https://yourdomain.com',
  
  // Example configurations for different domains:
  // API_BASE_URL: 'https://pwdmanagement.yourdomain.com/api',
  // STORAGE_BASE_URL: 'https://pwdmanagement.yourdomain.com',
  
  // Or if using subdirectories:
  // API_BASE_URL: 'https://yourdomain.com/pwd-backend/api',
  // STORAGE_BASE_URL: 'https://yourdomain.com/pwd-backend',
};

// Development Configuration (current)
const DEVELOPMENT_CONFIG = {
  API_BASE_URL: 'http://127.0.0.1:8000/api',
  STORAGE_BASE_URL: 'http://127.0.0.1:8000',
};

// Auto-detect environment
const isProduction = process.env.NODE_ENV === 'production' || 
                    window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1';

// Export the appropriate configuration
export const API_CONFIG = isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;

// Instructions for updating:
// 1. Replace 'yourdomain.com' with your actual Hostinger domain
// 2. If using subdirectories, adjust the paths accordingly
// 3. Make sure your Laravel backend is accessible at the API_BASE_URL
// 4. Test the configuration before deploying
