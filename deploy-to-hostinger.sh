#!/bin/bash
# Hostinger Deployment Script

echo "🚀 Starting Hostinger Deployment..."

# 1. Build React Frontend for Production
echo "📦 Building React frontend..."
cd pwd-frontend
npm install
npm run build
echo "✅ Frontend build completed"

# 2. Prepare Laravel Backend
echo "🔧 Preparing Laravel backend..."
cd ../pwd-backend

# Install production dependencies
composer install --optimize-autoloader --no-dev

# Clear and cache configurations
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Backend preparation completed"

# 3. Create deployment package
echo "📁 Creating deployment package..."
cd ..
mkdir -p deployment-package

# Copy backend files
cp -r pwd-backend/* deployment-package/
rm -rf deployment-package/node_modules
rm -rf deployment-package/tests

# Copy frontend build
mkdir -p deployment-package/frontend-build
cp -r pwd-frontend/build/* deployment-package/frontend-build/

echo "✅ Deployment package created in 'deployment-package' folder"

echo "🎉 Deployment preparation completed!"
echo ""
echo "Next steps:"
echo "1. Upload contents of 'deployment-package' folder to your Hostinger public_html"
echo "2. Create MySQL database in Hostinger control panel"
echo "3. Update .env file with your database credentials"
echo "4. Run: php artisan migrate --force"
echo "5. Set proper file permissions"
