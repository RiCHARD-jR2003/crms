# PWD RMS System - Network Startup Script
# This script starts both backend and frontend servers for network access

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    PWD RMS SYSTEM - NETWORK MODE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting servers for network access..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at:" -ForegroundColor White
Write-Host "  http://192.168.0.126:8000" -ForegroundColor Green
Write-Host "  http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend will be available at:" -ForegroundColor White
Write-Host "  http://192.168.0.126:3000" -ForegroundColor Green
Write-Host "  http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Other PCs can access the system using:" -ForegroundColor White
Write-Host "  http://192.168.0.126:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to start backend server
function Start-BackendServer {
    Write-Host "Starting Backend Server..." -ForegroundColor Yellow
    Set-Location "pwd-backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "php -S 0.0.0.0:8000 -t public"
    Set-Location ".."
    Start-Sleep -Seconds 3
}

# Function to start frontend server
function Start-FrontendServer {
    Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
    Set-Location "pwd-frontend"
    $env:REACT_APP_NETWORK_MODE = "true"
    $env:HOST = "0.0.0.0"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
    Set-Location ".."
}

# Start both servers
Start-BackendServer
Start-FrontendServer

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Please wait for the frontend to compile..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Once ready, you can access the system from any PC on the network using:" -ForegroundColor White
Write-Host "http://192.168.0.126:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)" -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Script completed. Servers are still running in separate windows." -ForegroundColor Green
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
