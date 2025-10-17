# 🚀 Hostinger Deployment Guide for PWD Management System

## 📋 Prerequisites
- ✅ Hostinger hosting account
- ✅ Domain name (optional, can use subdomain)
- ✅ GitHub repository access
- ✅ Local development environment

## 🔧 Step 1: Prepare Your Application

### Option A: Use the Deployment Script (Recommended)
```bash
# Windows
deploy-to-hostinger.bat

# Linux/Mac
chmod +x deploy-to-hostinger.sh
./deploy-to-hostinger.sh
```

### Option B: Manual Preparation
1. **Build Frontend:**
   ```bash
   cd pwd-frontend
   npm install
   npm run build
   ```

2. **Prepare Backend:**
   ```bash
   cd pwd-backend
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## 🌐 Step 2: Hostinger Setup

### 1. Access Hostinger Control Panel
- Login to your Hostinger account
- Go to **hPanel** (Hosting Control Panel)

### 2. Create Database
- Navigate to **MySQL Databases**
- Create a new database (e.g., `pwd_management`)
- Create a database user
- Assign user to database with full privileges
- **Note down:** Database name, username, password

### 3. File Manager Setup
- Go to **File Manager**
- Navigate to `public_html` directory
- **Clear existing files** (if any)

## 📁 Step 3: Upload Files

### Upload Backend Files
1. Upload contents of `deployment-package` folder to `public_html`
2. **Important:** Upload `.htaccess` file to root of `public_html`

### Upload Frontend Files
1. Create subdirectory: `public_html/admin`
2. Upload contents of `deployment-package/frontend-build` to `public_html/admin`

## ⚙️ Step 4: Configure Environment

### 1. Update .env File
```bash
APP_NAME="PWD Management System"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=your_email@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@yourdomain.com
MAIL_FROM_NAME="PWD Management System"
```

### 2. Generate Application Key
```bash
php artisan key:generate
```

## 🗄️ Step 5: Database Setup

### Run Migrations
```bash
php artisan migrate --force
```

### Create Storage Link
```bash
php artisan storage:link
```

## 🔒 Step 6: Set File Permissions

### Set Proper Permissions
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .htaccess
```

## 🌍 Step 7: Update Frontend Configuration

### Update API URLs
1. Edit `pwd-frontend/src/config/production.js`
2. Replace `yourdomain.com` with your actual domain
3. Rebuild frontend:
   ```bash
   cd pwd-frontend
   npm run build
   ```
4. Upload new build to `public_html/admin`

## 🔐 Step 8: SSL Certificate

### Enable SSL
1. Go to **SSL** section in hPanel
2. Enable **Free SSL Certificate**
3. Update all URLs to use `https://`

## 🧪 Step 9: Test Your Deployment

### Test Backend API
- Visit: `https://yourdomain.com/api/dashboard-stats`
- Should return JSON data (not error)

### Test Frontend
- Visit: `https://yourdomain.com/admin`
- Should load the React application

### Test Database Connection
- Try logging in with admin credentials
- Check if data is being saved/retrieved

## 🚨 Troubleshooting

### Common Issues:

#### 1. 500 Internal Server Error
- Check `.htaccess` file is uploaded
- Verify file permissions
- Check Laravel logs in `storage/logs`

#### 2. Database Connection Error
- Verify database credentials in `.env`
- Check if database exists
- Ensure user has proper permissions

#### 3. Frontend Not Loading
- Check if build files are uploaded correctly
- Verify API URLs in configuration
- Check browser console for errors

#### 4. File Upload Issues
- Check `storage` directory permissions
- Verify `storage:link` command was run
- Check upload limits in PHP settings

## 📊 Performance Optimization

### Enable Caching
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Optimize Composer
```bash
composer install --optimize-autoloader --no-dev
```

### Enable Gzip Compression
- Already included in `.htaccess` file

## 🔄 Updating Your Application

### For Future Updates:
1. Make changes locally
2. Run deployment script
3. Upload new files to Hostinger
4. Run `php artisan migrate` if database changes
5. Clear caches: `php artisan cache:clear`

## 📞 Support

### If You Need Help:
1. Check Hostinger documentation
2. Review Laravel deployment guides
3. Check application logs in `storage/logs`
4. Test API endpoints individually

---

## 🎉 Congratulations!

Your PWD Management System should now be live on Hostinger!

**Your URLs:**
- **Backend API:** `https://yourdomain.com/api`
- **Admin Panel:** `https://yourdomain.com/admin`
- **Application:** `https://yourdomain.com/app` (if you create this)

**Next Steps:**
1. Test all functionality
2. Set up email notifications
3. Configure backup schedules
4. Monitor performance
