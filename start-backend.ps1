# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

# Start Flask server
Write-Host "Backend server starting on http://localhost:5000" -ForegroundColor Green
python app.py
