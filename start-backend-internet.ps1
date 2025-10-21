# Start Laravel Backend Server for Internet Access
cd pwd-backend
Write-Host "Starting Laravel backend server on all interfaces..."
Write-Host "Backend will be accessible at: http://112.207.189.167:8000"
Write-Host "Local access: http://localhost:8000"
Write-Host ""
php artisan serve --host=0.0.0.0 --port=8000
