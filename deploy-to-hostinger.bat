@echo off
echo 🚀 Starting Hostinger Deployment...

REM 1. Build React Frontend for Production
echo 📦 Building React frontend...
cd pwd-frontend
call npm install
call npm run build
echo ✅ Frontend build completed

REM 2. Prepare Laravel Backend
echo 🔧 Preparing Laravel backend...
cd ..\pwd-backend

REM Install production dependencies
call composer install --optimize-autoloader --no-dev

REM Clear and cache configurations
call php artisan config:clear
call php artisan config:cache
call php artisan route:cache
call php artisan view:cache

echo ✅ Backend preparation completed

REM 3. Create deployment package
echo 📁 Creating deployment package...
cd ..
if exist deployment-package rmdir /s /q deployment-package
mkdir deployment-package

REM Copy backend files
xcopy pwd-backend\* deployment-package\ /E /I /Y
rmdir /s /q deployment-package\node_modules
rmdir /s /q deployment-package\tests

REM Copy frontend build
mkdir deployment-package\frontend-build
xcopy pwd-frontend\build\* deployment-package\frontend-build\ /E /I /Y

echo ✅ Deployment package created in 'deployment-package' folder

echo.
echo 🎉 Deployment preparation completed!
echo.
echo Next steps:
echo 1. Upload contents of 'deployment-package' folder to your Hostinger public_html
echo 2. Create MySQL database in Hostinger control panel
echo 3. Update .env file with your database credentials
echo 4. Run: php artisan migrate --force
echo 5. Set proper file permissions

pause
