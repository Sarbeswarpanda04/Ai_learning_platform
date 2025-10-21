# AI Learning Platform - Complete Setup Script for Windows PowerShell
# Run this script to set up both backend and frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI LEARNING PLATFORM - SETUP WIZARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command python)) {
    Write-Host "❌ Python is not installed. Please install Python 3.11+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command node)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Python installed: $(python --version)" -ForegroundColor Green
Write-Host "✅ Node.js installed: $(node --version)" -ForegroundColor Green
Write-Host ""

# Setup Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETTING UP BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "$projectRoot\backend"

Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
python -m venv venv

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "Creating .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your configuration." -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists." -ForegroundColor Yellow
}

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host ""

# Setup Frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETTING UP FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "$projectRoot\frontend"

Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Creating .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created." -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists." -ForegroundColor Yellow
}

Write-Host "✅ Frontend setup complete!" -ForegroundColor Green
Write-Host ""

# Final instructions
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To start the application:" -ForegroundColor Green
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python app.py" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Access the app at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API runs at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Green
Write-Host "  Student: student@example.com / student123" -ForegroundColor White
Write-Host "  Teacher: teacher@example.com / teacher123" -ForegroundColor White
Write-Host "  Admin: admin@example.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host "For Docker setup, run: docker-compose up -d" -ForegroundColor Yellow
Write-Host ""
Write-Host "Need help? Check QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""
