# 🚀 Hostinger Deployment Instructions for lightgoldenrodyellow-ibis-644404.hostingersite.com

## 📋 Quick Deployment Steps

### 1. Upload Files to Hostinger
- Upload ALL contents of `deployment-package` folder to your `public_html` directory
- Make sure `.htaccess` file is uploaded to the root of `public_html`

### 2. Create Database in Hostinger hPanel
1. Go to **MySQL Databases** in hPanel
2. Create database: `pwd_management`
3. Create user: `pwd_user`
4. Set password: `secure_password123`
5. Assign user to database with full privileges

### 3. Configure Environment File
Create `.env` file in `public_html` with these settings:

```env
APP_NAME="PWD Management System"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://lightgoldenrodyellow-ibis-644404.hostingersite.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=pwd_management
DB_USERNAME=pwd_user
DB_PASSWORD=secure_password123

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=your_email@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@yourdomain.com
MAIL_FROM_NAME="PWD Management System"
```

### 4. Generate Application Key
Run this command in Hostinger terminal or via SSH:
```bash
php artisan key:generate
```

### 5. Run Database Migrations
```bash
php artisan migrate --force
php artisan storage:link
```

### 6. Set File Permissions
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .htaccess
```

## 🌐 Your Application URLs

- **Main Application:** https://lightgoldenrodyellow-ibis-644404.hostingersite.com/
- **Admin Panel:** https://lightgoldenrodyellow-ibis-644404.hostingersite.com/admin/
- **API Endpoints:** https://lightgoldenrodyellow-ibis-644404.hostingersite.com/api/

## 🔧 Frontend Configuration

The frontend has been configured to use your Hostinger domain:
- API calls will go to: `https://lightgoldenrodyellow-ibis-644404.hostingersite.com/api`
- File uploads will use: `https://lightgoldenrodyellow-ibis-644404.hostingersite.com/storage`

## ✅ Testing Your Deployment

1. **Test Backend API:**
   - Visit: https://lightgoldenrodyellow-ibis-644404.hostingersite.com/api/dashboard-stats
   - Should return JSON data

2. **Test Frontend:**
   - Visit: https://lightgoldenrodyellow-ibis-644404.hostingersite.com/admin
   - Should load the React application

3. **Test Database:**
   - Try logging in with admin credentials
   - Check if data is being saved/retrieved

## 🚨 Troubleshooting

### If you get 500 errors:
- Check if `.htaccess` file is uploaded
- Verify file permissions
- Check Laravel logs in `storage/logs`

### If database connection fails:
- Verify database credentials in `.env`
- Check if database exists
- Ensure user has proper permissions

### If frontend doesn't load:
- Check if build files are uploaded correctly
- Verify API URLs in browser console
- Check for CORS issues

## 📞 Support

If you encounter issues:
1. Check Hostinger documentation
2. Review Laravel deployment guides
3. Check application logs in `storage/logs`
4. Test API endpoints individually

---

## 🎉 Success!

Once deployed, your PWD Management System will be live at:
**https://lightgoldenrodyellow-ibis-644404.hostingersite.com**
