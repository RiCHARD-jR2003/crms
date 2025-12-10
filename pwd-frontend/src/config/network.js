// Cloudflare Tunnel Configuration
const CLOUDFLARE_TUNNEL_CONFIG = {
  // Backend API through Cloudflare tunnel
  API_BASE_URL: 'https://may-acceptable-fitting-exit.trycloudflare.com/api',
  STORAGE_BASE_URL: 'https://may-acceptable-fitting-exit.trycloudflare.com',
};

// Network Development Configuration (using tunnel)
const NETWORK_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Development Configuration (using tunnel)
const DEVELOPMENT_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Production Configuration (using tunnel)
const PRODUCTION_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Auto-detect environment
const isProduction = process.env.NODE_ENV === 'production' || 
                    window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1';

const isNetworkMode = process.env.REACT_APP_NETWORK_MODE === 'true' ||
                     window.location.hostname === '192.168.0.126' ||
                     window.location.hostname.includes('192.168.');

// Export the appropriate configuration - always use tunnel
export const API_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Instructions for network access:
// 1. Make sure the backend is running on 192.168.0.126:8000
// 2. Start the frontend with network mode enabled
// 3. Access from other PCs using: http://192.168.0.126:3000
// 4. Update the IP address in this file if your network IP changes
