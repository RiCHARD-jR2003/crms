// Cloudflare Tunnel Configuration
const CLOUDFLARE_TUNNEL_CONFIG = {
  API_BASE_URL: 'https://farming-artists-representing-houston.trycloudflare.com/api',
  STORAGE_BASE_URL: 'https://farming-artists-representing-houston.trycloudflare.com',
};

// Production API Configuration (using tunnel)
const PRODUCTION_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Network Development Configuration (using tunnel)
const NETWORK_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Development Configuration (using tunnel)
const DEVELOPMENT_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Export configuration - always use tunnel
export const API_CONFIG = CLOUDFLARE_TUNNEL_CONFIG;

// Instructions for Cloudflare tunnel access:
// 1. Make sure the backend is running on localhost:8000
// 2. Start Cloudflare tunnel for backend: cloudflared tunnel --url http://localhost:8000
// 3. Start the frontend with: npm start
// 4. Start Cloudflare tunnel for frontend: cloudflared tunnel --url http://localhost:3000
// 5. Access frontend at: https://speakers-calendar-avi-assumes.trycloudflare.com
// 6. Backend API will be at: https://farming-artists-representing-houston.trycloudflare.com/api
