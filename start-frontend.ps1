# Start Frontend Dev Server
Write-Host "Starting Frontend Dev Server..." -ForegroundColor Cyan

$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath

# Start Vite dev server
Write-Host "Frontend server starting on http://localhost:5173" -ForegroundColor Green
npm run dev
