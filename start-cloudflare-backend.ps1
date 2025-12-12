# Start Laravel Backend Server with Cloudflare Tunnel
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    BACKEND SERVER + CLOUDFLARE TUNNEL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "Starting Laravel Backend Server..." -ForegroundColor Yellow
Set-Location "pwd-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Laravel Backend Server' -ForegroundColor Green; Write-Host 'Running on: http://localhost:8000' -ForegroundColor Cyan; php artisan serve --host=0.0.0.0 --port=8000"
Set-Location ".."
Write-Host "Waiting for backend server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify backend is running before starting tunnel
Write-Host "Verifying backend is accessible..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries -and -not $backendReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        $backendReady = $true
        Write-Host "✓ Backend is ready!" -ForegroundColor Green
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "  Waiting... ($retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        } else {
            Write-Host "✗ Backend failed to start after $maxRetries attempts" -ForegroundColor Red
            Write-Host "  Please check the backend server window for errors" -ForegroundColor Yellow
            Write-Host "  You can still start the tunnel manually if the server is running" -ForegroundColor Yellow
        }
    }
}

# Start Cloudflare Tunnel for Backend
Write-Host "Starting Cloudflare Tunnel for Backend..." -ForegroundColor Yellow
Write-Host "Backend URL: https://main-named-robot-suspected.trycloudflare.com" -ForegroundColor Green
Write-Host ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Cloudflare Tunnel - Backend' -ForegroundColor Green; Write-Host 'Tunneling: http://localhost:8000 -> https://main-named-robot-suspected.trycloudflare.com' -ForegroundColor Cyan; .\cloudflared.exe tunnel --url http://localhost:8000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend Server and Cloudflare Tunnel Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Local Backend: http://localhost:8000" -ForegroundColor White
Write-Host "Cloudflare Backend: https://main-named-robot-suspected.trycloudflare.com" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit (servers will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

