# 🧪 **Test Accounts Summary**

## 🌐 **Server Access Information:**
- **Public IP:** `112.207.189.167`
- **Frontend URL:** `http://112.207.189.167:3000`
- **Backend API:** `http://112.207.189.167:8000`

---

## 👥 **PWD Member Test Accounts:**

### **1. Juan Santos Dela Cruz**
- **Username:** `testmember`
- **Email:** `testmember@pwd.com`
- **Password:** `testmember123`
- **Disability Type:** Physical Disability
- **Gender:** Male
- **Birth Date:** May 15, 1990
- **Address:** 123 Main Street, Barangay Sample

### **2. Maria Lopez Garcia**
- **Username:** `maria`
- **Email:** `maria@pwd.com`
- **Password:** `maria123`
- **Disability Type:** Visual Impairment
- **Gender:** Female
- **Birth Date:** August 22, 1985
- **Address:** 456 Oak Avenue, Barangay Central

### **3. Pedro Mendoza Reyes**
- **Username:** `pedro`
- **Email:** `pedro@pwd.com`
- **Password:** `pedro123`
- **Disability Type:** Hearing Impairment
- **Gender:** Male
- **Birth Date:** December 10, 1978
- **Address:** 789 Pine Street, Barangay North

---

## 🏢 **Staff Test Accounts:**

### **Admin Account:**
- **Username:** `admin`
- **Email:** `admin@pdao.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Reports, Document Management

### **SuperAdmin Account:**
- **Username:** `superadmin`
- **Email:** `superadmin@pdao.com`
- **Password:** `superadmin123`
- **Role:** SuperAdmin
- **Access:** Full system access

### **Staff1 Account:**
- **Username:** `staff1`
- **Email:** `staff1@pdao.com`
- **Password:** `staff123`
- **Role:** Staff1
- **Access:** PWD Masterlist, PWD Records

### **Staff2 Account:**
- **Username:** `staff2`
- **Email:** `staff2@pdao.com`
- **Password:** `staff123`
- **Role:** Staff2
- **Access:** Ayuda, Benefit Tracking

### **FrontDesk Account:**
- **Username:** `frontdesk`
- **Email:** `frontdesk@pdao.com`
- **Password:** `frontdesk123`
- **Role:** FrontDesk
- **Access:** PWD Card (Release/Renew), Support Desk, Announcement

---

## 🧪 **Testing Instructions:**

### **1. Local Testing:**
- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:8000`

### **2. Internet Testing:**
- **Frontend:** `http://112.207.189.167:3000`
- **Backend:** `http://112.207.189.167:8000`

### **3. Mobile Testing:**
- Use mobile data or different WiFi network
- Navigate to: `http://112.207.189.167:3000`
- Test login with any of the accounts above

---

## 🔧 **Server Management:**

### **Start Servers:**
```powershell
# Backend
.\start-backend-internet.ps1

# Frontend
.\start-frontend-internet.ps1
```

### **Manual Start:**
```powershell
# Backend
cd pwd-backend
php artisan serve --host=0.0.0.0 --port=8000

# Frontend
cd pwd-frontend
$env:HOST = "0.0.0.0"
npm start
```

---

## 📱 **Features to Test:**

### **PWD Member Features:**
- ✅ Login/Logout
- ✅ Dashboard
- ✅ Profile Management
- ✅ Document Upload
- ✅ QR Code Display
- ✅ Support Desk (Chat Interface)
- ✅ Announcements

### **Staff Features:**
- ✅ Role-based Access Control
- ✅ Dashboard Analytics
- ✅ PWD Records Management
- ✅ Document Management
- ✅ Support Desk (Admin Side)
- ✅ Benefit Tracking
- ✅ Ayuda Management

---

## 🚨 **Important Notes:**

1. **All accounts are active and ready for testing**
2. **Servers are configured for internet access**
3. **Firewall rules may need to be configured**
4. **Router port forwarding may be required**
5. **Test from different networks for full verification**

**Happy Testing!** 🎉
