# Start React Frontend Server for Internet Access
cd pwd-frontend
Write-Host "Starting React frontend server on all interfaces..."
Write-Host "Frontend will be accessible at: http://112.207.189.167:3000"
Write-Host "Local access: http://localhost:3000"
Write-Host ""
$env:HOST = "0.0.0.0"
npm start
