# Start Servers for Internet Access

## 🌐 **Your Public IP Address:**
**112.207.189.167**

## 🚀 **Server Setup Instructions:**

### **Step 1: Start Backend Server (Laravel)**
```powershell
cd pwd-backend
php artisan serve --host=0.0.0.0 --port=8000
```

### **Step 2: Start Frontend Server (React)**
```powershell
cd pwd-frontend
set HOST=0.0.0.0
npm start
```

## 🔧 **Alternative: Use PowerShell Scripts**

I'll create scripts to make this easier for you.

### **Backend Server Script:**
```powershell
# start-backend-internet.ps1
cd pwd-backend
Write-Host "Starting Laravel backend server on all interfaces..."
Write-Host "Backend will be accessible at: http://112.207.189.167:8000"
php artisan serve --host=0.0.0.0 --port=8000
```

### **Frontend Server Script:**
```powershell
# start-frontend-internet.ps1
cd pwd-frontend
Write-Host "Starting React frontend server on all interfaces..."
Write-Host "Frontend will be accessible at: http://112.207.189.167:3000"
$env:HOST = "0.0.0.0"
npm start
```

## 🌍 **Access URLs:**

### **From Other Devices:**
- **Frontend:** `http://112.207.189.167:3000`
- **Backend API:** `http://112.207.189.167:8000`

### **From Your Local Machine:**
- **Frontend:** `http://localhost:3000` or `http://127.0.0.1:3000`
- **Backend API:** `http://localhost:8000` or `http://127.0.0.1:8000`

## ⚠️ **Important Notes:**

### **1. Firewall Configuration:**
Make sure Windows Firewall allows connections on ports 3000 and 8000:
```powershell
# Allow port 3000 (Frontend)
netsh advfirewall firewall add rule name="React Dev Server" dir=in action=allow protocol=TCP localport=3000

# Allow port 8000 (Backend)
netsh advfirewall firewall add rule name="Laravel Server" dir=in action=allow protocol=TCP localport=8000
```

### **2. Router Port Forwarding:**
You may need to configure port forwarding on your router:
- **Port 3000** → Forward to your local IP (192.168.x.x:3000)
- **Port 8000** → Forward to your local IP (192.168.x.x:8000)

### **3. Network Configuration:**
- **Backend:** Uses `--host=0.0.0.0` to bind to all network interfaces
- **Frontend:** Uses `HOST=0.0.0.0` environment variable to bind to all interfaces

## 🔍 **Testing Access:**

### **From Another Device:**
1. Open browser on another device
2. Navigate to: `http://112.207.189.167:3000`
3. The React app should load
4. API calls will go to: `http://112.207.189.167:8000`

### **Troubleshooting:**
- If connection fails, check Windows Firewall settings
- If still failing, check router port forwarding
- Ensure both servers are running with `0.0.0.0` binding

## 📱 **Mobile Testing:**
- Use the same URLs on mobile devices
- Ensure mobile device is on a different network (not same WiFi)
- Test from mobile data or different WiFi network

**Your servers are now configured for internet access!** 🌐
