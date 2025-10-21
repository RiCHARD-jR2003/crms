# PWD RMS System - Network Access Setup

This guide explains how to run the PWD RMS system so it's accessible from other PCs on your network.

## Quick Start

### Option 1: Automated Startup (Recommended)
Run the main startup script from the project root:
```powershell
powershell -ExecutionPolicy Bypass -File "start-network-servers.ps1"
```

### Option 2: Manual Startup
1. **Start Backend Server:**
   ```powershell
   cd pwd-backend
   powershell -ExecutionPolicy Bypass -File "start-server-network.ps1"
   ```

2. **Start Frontend Server:**
   ```powershell
   cd pwd-frontend
   powershell -ExecutionPolicy Bypass -File "start-network.ps1"
   ```

### Option 3: Using npm scripts
1. **Backend:** Use the existing PowerShell script
2. **Frontend:** 
   ```powershell
   cd pwd-frontend
   npm run start:network
   ```

## Network Configuration

### Your Current Network Settings
- **Your IP Address:** `192.168.0.126`
- **Backend URL:** `http://192.168.0.126:8000`
- **Frontend URL:** `http://192.168.0.126:3000`
- **API Endpoint:** `http://192.168.0.126:8000/api`

### Access URLs
- **Local Access:** `http://localhost:3000` (frontend) / `http://localhost:8000` (backend)
- **Network Access:** `http://192.168.0.126:3000` (frontend) / `http://192.168.0.126:8000` (backend)

## Testing Network Access

Run the test script to verify both servers are running:
```powershell
powershell -ExecutionPolicy Bypass -File "test-network-servers.ps1"
```

## Accessing from Other PCs

1. **Ensure all PCs are on the same network** (same WiFi or LAN)
2. **Open a web browser** on the other PC
3. **Navigate to:** `http://192.168.0.126:3000`
4. **The PWD RMS system should load** and be fully functional

## Troubleshooting

### Backend Not Accessible
- Check Windows Firewall settings
- Ensure port 8000 is not blocked
- Verify PHP is installed and working
- Check if another service is using port 8000

### Frontend Not Accessible
- Check Windows Firewall settings
- Ensure port 3000 is not blocked
- Verify Node.js and npm are installed
- Check if another service is using port 3000

### Network Issues
- Ensure all PCs are on the same network
- Check if your router blocks inter-device communication
- Try accessing from the same PC first: `http://192.168.0.126:3000`

### IP Address Changes
If your IP address changes, update these files:
1. `pwd-backend/start-server-network.ps1` - Update the IP in the display message
2. `pwd-frontend/src/config/production.js` - Update the NETWORK_CONFIG IP
3. `pwd-frontend/start-network.ps1` - Update the IP in the display message

## Security Notes

⚠️ **Important Security Considerations:**
- This setup is for **development/testing only**
- The servers are accessible to anyone on your network
- Do not use this configuration in production
- Consider using HTTPS for production deployments

## File Structure

```
crms-updated/
├── start-network-servers.ps1     # Main startup script
├── test-network-servers.ps1      # Test script
├── pwd-backend/
│   └── start-server-network.ps1  # Backend network script
└── pwd-frontend/
    ├── start-network.ps1         # Frontend network script
    └── src/config/
        └── production.js         # Updated with network config
```

## Support

If you encounter issues:
1. Run the test script first
2. Check Windows Firewall settings
3. Verify both servers are running
4. Ensure all PCs are on the same network
5. Check the console output for error messages
