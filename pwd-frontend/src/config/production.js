// Cloudflare Tunnel Configuration
const CLOUDFLARE_TUNNEL_CONFIG = {
  API_BASE_URL: 'https://may-acceptable-fitting-exit.trycloudflare.com/api',
  STORAGE_BASE_URL: 'https://may-acceptable-fitting-exit.trycloudflare.com',
};

// Production API Configuration (using tunnel)
const PRODUCTION_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Network Development Configuration (using tunnel)
const NETWORK_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Development Configuration (using tunnel)
const DEVELOPMENT_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Export configuration - always use tunnel
export const API_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Instructions for updating:
// 1. Replace 'yourdomain.com' with your actual Hostinger domain
// 2. If using subdirectories, adjust the paths accordingly
// 3. Make sure your Laravel backend is accessible at the API_BASE_URL
// 4. Test the configuration before deploying
