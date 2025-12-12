# Understanding 502 Bad Gateway Error

## What is a 502 Bad Gateway Error?

A **502 Bad Gateway** error means:
- ✅ Your Cloudflare tunnel IS running and accessible
- ❌ BUT the tunnel CANNOT reach your backend server
- The tunnel acts as a "middleman" - it receives requests but can't forward them to your backend

## Visual Explanation:

```
Browser → Cloudflare Tunnel (✅ Working) → Backend Server (❌ NOT Running)
         https://hose-cherry-rapid-complement.trycloudflare.com
                                                              ↓
                                                         localhost:8000
                                                         (Server not running!)
```

## Common Causes:

1. **Backend server is not running** (Most Common)
   - Laravel server must be running on `localhost:8000`
   - Cloudflare tunnel tries to connect but finds nothing

2. **Backend server crashed or stopped**
   - Server was running but stopped/crashed
   - Check the backend terminal window for errors

3. **Wrong port**
   - Backend running on different port
   - Tunnel pointing to wrong port

4. **Firewall blocking connection**
   - Windows Firewall blocking localhost connections
   - Antivirus blocking the connection

## How to Fix:

### Step 1: Check if Backend is Running

Open a new PowerShell terminal and run:
```powershell
.\troubleshoot-backend.ps1
```

Or manually test:
```powershell
# Test if backend responds
curl http://localhost:8000
# Or open in browser: http://localhost:8000
```

### Step 2: Start the Backend Server

If backend is NOT running, start it:

**Option A: Use the startup script**
```powershell
.\start-cloudflare-backend.ps1
```

**Option B: Start manually**
```powershell
# Terminal 1: Start Backend
cd pwd-backend
php artisan serve --host=0.0.0.0 --port=8000
```

Keep this terminal open! You should see:
```
Laravel development server started: http://0.0.0.0:8000
```

### Step 3: Start Cloudflare Tunnel

**Option A: If using the script, it starts automatically**

**Option B: Start manually in a separate terminal**
```powershell
# Terminal 2: Start Cloudflare Tunnel
.\cloudflared.exe tunnel --url http://localhost:8000
```

You should see:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://hose-cherry-rapid-complement.trycloudflare.com                                    |
+--------------------------------------------------------------------------------------------+
```

### Step 4: Verify Everything is Working

1. **Test backend locally first:**
   - Open: `http://localhost:8000/api/test-basic`
   - Should return JSON: `{"message":"Server is working!","status":"OK"}`

2. **Test through Cloudflare tunnel:**
   - Open: `https://hose-cherry-rapid-complement.trycloudflare.com/api/test-basic`
   - Should return the same JSON

## Quick Diagnostic Checklist:

- [ ] Backend server is running (check terminal window)
- [ ] Backend responds to `http://localhost:8000`
- [ ] Cloudflare tunnel is running (check terminal window)
- [ ] No firewall blocking localhost:8000
- [ ] PHP is installed and in PATH
- [ ] No errors in backend terminal

## Common Error Messages:

### "Connection refused"
→ Backend server is NOT running
**Fix:** Start the backend server

### "Timeout"
→ Backend is slow to respond or not accessible
**Fix:** Check if backend is actually running and responding

### "502 Bad Gateway" (what you're seeing)
→ Tunnel can't reach backend
**Fix:** Make sure backend is running on localhost:8000

## Still Having Issues?

1. **Check backend terminal for errors:**
   - Look for PHP errors
   - Check for database connection issues
   - Verify .env file is correct

2. **Restart everything:**
   - Stop all terminals
   - Start backend first
   - Wait 5 seconds
   - Start tunnel second

3. **Check port 8000 is free:**
   ```powershell
   netstat -ano | findstr :8000
   ```
   If something else is using port 8000, stop it or change the port

## Summary:

**502 Bad Gateway = Backend server is not running or not accessible**

The fix is almost always: **Start your Laravel backend server!**

```powershell
cd pwd-backend
php artisan serve --host=0.0.0.0 --port=8000
```

