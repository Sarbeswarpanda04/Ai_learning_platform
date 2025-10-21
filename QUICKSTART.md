# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Option 1: Using Docker (Recommended)

1. **Install Docker and Docker Compose**
   - Download from: https://www.docker.com/products/docker-desktop

2. **Clone and Run**
   ```powershell
   cd "AI_Learning_Platform"
   
   # Create environment file
   cp .env.example .env
   
   # Start all services
   docker-compose up -d
   ```

3. **Access the Application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - Login with: student@example.com / student123

### Option 2: Manual Setup

#### Backend Setup (5 mins)

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env if needed

# Run server
python app.py
# Backend runs on http://localhost:5000
```

#### Frontend Setup (3 mins)

```powershell
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
# Frontend runs on http://localhost:5173
```

## 📝 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@example.com | student123 |
| **Teacher** | teacher@example.com | teacher123 |
| **Admin** | admin@example.com | admin123 |

## 🎯 What to Try First

1. **Login as Student** → View adaptive dashboard
2. **Browse Lessons** → Check out the lesson library
3. **Take a Quiz** → Experience AI feedback
4. **View Progress** → See analytics and recommendations
5. **Try Offline Mode** → Disconnect internet and test PWA
6. **Login as Teacher** → Create lessons and quizzes

## 🔧 Common Issues

### Backend won't start
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check if port 5000 is available
netstat -ano | findstr :5000
```

### Frontend won't start
```powershell
# Clear cache and reinstall
rm -r node_modules
rm package-lock.json
npm install

# Try different port
npm run dev -- --port 3000
```

### Database issues
```powershell
# Delete existing database
rm backend/learning_platform.db

# Restart backend (it will recreate DB with sample data)
python app.py
```

## 📱 Test PWA Features

1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Check "Service Workers" and "IndexedDB"
4. Toggle offline mode in "Network" tab
5. Try browsing lessons offline!

## 🐛 Need Help?

- Check the full README.md for detailed documentation
- Open an issue on GitHub
- Contact: your-email@example.com

## 🎓 Next Steps

- Read the [API Documentation](README.md#api-documentation)
- Explore the [Project Structure](README.md#project-structure)
- Learn about [Deployment Options](README.md#deployment)
- Customize the theme in `frontend/tailwind.config.js`
- Add your own lessons and content!

---

**Happy Learning! 🚀**
