# Test Network Servers Script
Write-Host "Testing PWD RMS Network Servers..." -ForegroundColor Cyan
Write-Host ""

# Test Backend
Write-Host "Testing Backend Server (http://192.168.0.126:8000)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://192.168.0.126:8000" -TimeoutSec 10
    Write-Host "✓ Backend Server is running! Status: $($backendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend Server is not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test Frontend
Write-Host "Testing Frontend Server (http://192.168.0.126:3000)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://192.168.0.126:3000" -TimeoutSec 10
    Write-Host "✓ Frontend Server is running! Status: $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend Server is not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Network Access Information:" -ForegroundColor Cyan
Write-Host "Backend API: http://192.168.0.126:8000/api" -ForegroundColor White
Write-Host "Frontend App: http://192.168.0.126:3000" -ForegroundColor White
Write-Host ""
Write-Host "Other PCs on the network can access the system using:" -ForegroundColor Yellow
Write-Host "http://192.168.0.126:3000" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
