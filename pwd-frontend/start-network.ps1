# React Frontend Development Server - Network Accessible Version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    REACT DEVELOPMENT SERVER" -ForegroundColor Yellow
Write-Host "    NETWORK ACCESSIBLE VERSION" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting frontend server on: http://192.168.0.126:3000" -ForegroundColor Green
Write-Host "Also accessible on: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Backend should be running on: http://192.168.0.126:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variable for network mode
$env:REACT_APP_NETWORK_MODE = "true"
$env:HOST = "0.0.0.0"

# Start the React development server
npm start

Write-Host ""
Write-Host "Frontend server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
