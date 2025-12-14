// Cloudflare Tunnel Configuration
const CLOUDFLARE_TUNNEL_CONFIG = {
  // Backend API through Cloudflare tunnel
  API_BASE_URL: 'https://attachments-sand-gave-shame.trycloudflare.com/api',
  STORAGE_BASE_URL: 'https://attachments-sand-gave-shame.trycloudflare.com',
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

// Instructions for Cloudflare tunnel access:
// 1. Make sure the backend is running on localhost:8000
// 2. Start Cloudflare tunnel for backend: cloudflared tunnel --url http://localhost:8000
// 3. Start the frontend with: npm start
// 4. Start Cloudflare tunnel for frontend: cloudflared tunnel --url http://localhost:3000
// 5. Access frontend at: https://uniprotkb-designated-cases-walked.trycloudflare.com
// 6. Backend API will be at: https://attachments-sand-gave-shame.trycloudflare.com/api
