# Laravel Development Server - Network Accessible Version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    LARAVEL DEVELOPMENT SERVER" -ForegroundColor Yellow
Write-Host "    NETWORK ACCESSIBLE VERSION" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting server on: http://192.168.18.25:8000" -ForegroundColor Green
Write-Host "Also accessible on: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the PHP development server on all interfaces
php -S 0.0.0.0:8000 -t public

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
