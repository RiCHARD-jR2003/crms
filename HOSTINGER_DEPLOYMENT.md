# Hostinger Deployment Configuration

## Backend (Laravel) Setup

### 1. Upload Files
- Upload the `pwd-backend` folder contents to your domain's `public_html` directory
- Make sure `.htaccess` file is uploaded

### 2. Database Configuration
- Create MySQL database in Hostinger control panel
- Update `.env` file with Hostinger database credentials:
```
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

### 3. Environment Configuration
- Set `APP_ENV=production`
- Set `APP_DEBUG=false`
- Generate new `APP_KEY` using: `php artisan key:generate`
- Update `APP_URL` to your domain: `https://yourdomain.com`

### 4. File Permissions
- Set storage directory permissions: `chmod -R 755 storage`
- Set bootstrap/cache permissions: `chmod -R 755 bootstrap/cache`

### 5. Laravel Commands (Run in Terminal)
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link
```

## Frontend (React) Setup

### 1. Build for Production
```bash
cd pwd-frontend
npm install
npm run build
```

### 2. Upload Build Files
- Upload contents of `pwd-frontend/build` folder to a subdirectory like `public_html/admin` or `public_html/app`

### 3. Update API URLs
- Update `API_BASE_URL` in production build to point to your Laravel backend
- Example: `https://yourdomain.com/api`

## Domain Structure
```
yourdomain.com/          -> Laravel backend (API)
yourdomain.com/admin/    -> React frontend (Admin panel)
yourdomain.com/app/      -> React frontend (PWD member app)
```

## SSL Certificate
- Enable SSL certificate in Hostinger control panel
- Update all URLs to use HTTPS

## Performance Optimization
- Enable Gzip compression
- Set up CDN if needed
- Configure caching headers
- Optimize images
