# 🎓 AI-Driven Personalized Learning Platform

> An intelligent, adaptive learning system designed for engineering students in semi-urban and rural regions. Built with Flask (Python) backend and React + Vite frontend, featuring AI-powered recommendations, offline support, and responsive design.

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🌟 Overview

The **AI-Driven Personalized Learning Platform** is designed to democratize quality education for engineering students in areas with limited access to resources. The platform uses machine learning to adapt to each learner's pace, detect weak areas, and provide personalized feedback—all while working seamlessly both online and offline.

### Problem Statement
Students in semi-urban and rural regions often lack:
- Access to quality educational content
- Personalized learning experiences
- Reliable internet connectivity
- Adaptive feedback mechanisms

### Solution
Our platform provides:
- 🤖 **AI-powered adaptive learning** that adjusts to student performance
- 📱 **Progressive Web App (PWA)** with full offline functionality
- 🎨 **Responsive, animated UI** that works on low-cost devices
- 📊 **Real-time analytics** for both students and teachers
- 🔒 **Secure authentication** with JWT and Google OAuth
- 🌐 **Offline-first architecture** with IndexedDB storage

---

## ✨ Key Features

### For Students 👩‍🎓

- **Adaptive Learning Path**: AI recommends lessons based on performance
- **Real-Time Feedback**: Instant hints and explanations for quiz attempts
- **Offline Access**: Download lessons and quizzes, sync when online
- **Progress Dashboard**: Visual graphs showing mastery levels
- **Achievements System**: Badges and milestones for motivation
- **Multi-Subject Support**: Covers multiple engineering disciplines

### For Teachers 👨‍🏫

- **Content Management**: Create and edit lessons with Markdown support
- **Quiz Builder**: Design multiple-choice questions with explanations
- **Analytics Dashboard**: Track student performance and identify weak areas
- **CSV Import/Export**: Bulk operations for efficient management
- **Class Management**: Organize students and assign lessons

### Platform Features ⚙️

- **Dark/Light Mode**: Eye-friendly interface with theme toggle
- **Responsive Design**: Works on mobile, tablet, and desktop
- **PWA Support**: Installable as native app on mobile devices
- **Secure API**: JWT-based authentication with role-based access
- **AI/ML Engine**: Bayesian Knowledge Tracing for skill assessment
- **Background Sync**: Automatic data synchronization when online

---

## 🛠 Technology Stack

### Backend
- **Flask 3.0** - Lightweight Python web framework
- **Flask-RESTful** - REST API development
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT authentication
- **PostgreSQL** - Primary database (SQLite for development)
- **scikit-learn** - Machine learning models
- **Gunicorn** - Production WSGI server

### Frontend
- **React 18.2** - UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **IndexedDB (idb)** - Offline storage
- **Workbox** - Service worker management
- **Zustand** - State management

### DevOps
- **Docker** - Containerization
- **docker-compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving
- **Redis** - Caching and rate limiting (optional)

---

## 📁 Project Structure

```
AI_Learning_Platform/
│
├── backend/                    # Flask Backend
│   ├── app.py                 # Main application entry
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database initialization
│   ├── requirements.txt       # Python dependencies
│   │
│   ├── models/                # Database models
│   │   ├── user.py           # User & StudentProfile models
│   │   ├── lesson.py         # Lesson & LessonProgress models
│   │   └── quiz.py           # Quiz, Attempt & QuizSession models
│   │
│   ├── routes/                # API endpoints
│   │   ├── auth_routes.py    # Authentication endpoints
│   │   ├── lesson_routes.py  # Lesson CRUD operations
│   │   ├── quiz_routes.py    # Quiz management
│   │   └── ml_routes.py      # AI/ML endpoints
│   │
│   ├── ml_engine/             # AI/ML Module
│   │   └── recommend.py      # Recommendation engine
│   │
│   └── utils/                 # Utility functions
│       └── security.py       # Auth helpers & validators
│
├── frontend/                  # React Frontend
│   ├── index.html            # Entry HTML
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind configuration
│   │
│   ├── public/               # Static assets
│   │   └── manifest.json    # PWA manifest
│   │
│   └── src/
│       ├── main.jsx         # Application entry
│       ├── App.jsx          # Main App component
│       │
│       ├── pages/           # Page components
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── LessonPage.jsx
│       │   ├── QuizPage.jsx
│       │   └── ProgressPage.jsx
│       │
│       ├── components/      # Reusable components
│       │   ├── Navbar.jsx
│       │   ├── OfflineBanner.jsx
│       │   └── ProtectedRoute.jsx
│       │
│       ├── utils/           # Utility functions
│       │   ├── api.js      # API client
│       │   ├── db.js       # IndexedDB operations
│       │   └── store.js    # Zustand stores
│       │
│       └── styles/          # CSS files
│           └── index.css    # Global styles
│
├── Dockerfile.backend        # Backend Docker image
├── Dockerfile.frontend       # Frontend Docker image
├── docker-compose.yml        # Multi-container setup
└── README.md                 # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 15+** (or use SQLite for development)
- **Git**

### Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Create virtual environment**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```powershell
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Initialize database**
   ```powershell
   python app.py
   # Database will be created with sample data
   ```

6. **Run development server**
   ```powershell
   python app.py
   # Server runs on http://localhost:5000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Configure environment variables**
   ```powershell
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Run development server**
   ```powershell
   npm run dev
   # App runs on http://localhost:5173
   ```

### Docker Setup (Recommended for Production)

1. **Build and start all services**
   ```powershell
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - Database: localhost:5432

3. **View logs**
   ```powershell
   docker-compose logs -f
   ```

4. **Stop services**
   ```powershell
   docker-compose down
   ```

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

### Authentication

All authenticated endpoints require JWT token in header:
```
Authorization: Bearer <access_token>
```

### Endpoints Overview

#### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/google` | Google OAuth login | No |
| POST | `/refresh` | Refresh access token | Yes (Refresh) |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/change-password` | Change password | Yes |

#### Lessons (`/api/lessons`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all lessons | Yes | All |
| GET | `/:id` | Get lesson by ID | Yes | All |
| POST | `/` | Create lesson | Yes | Teacher/Admin |
| PUT | `/:id` | Update lesson | Yes | Teacher/Admin |
| DELETE | `/:id` | Delete lesson | Yes | Teacher/Admin |
| POST | `/:id/progress` | Update progress | Yes | Student |
| GET | `/subjects` | Get unique subjects | Yes | All |
| GET | `/my-lessons` | Get teacher's lessons | Yes | Teacher/Admin |

#### Quizzes (`/api/quiz`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/lesson/:id/quizzes` | Get lesson quizzes | Yes | All |
| GET | `/:id` | Get quiz by ID | Yes | All |
| POST | `/:id/attempt` | Submit quiz attempt | Yes | Student |
| POST | `/session/start` | Start quiz session | Yes | Student |
| POST | `/session/:id/complete` | Complete session | Yes | Student |
| POST | `/` | Create quiz | Yes | Teacher/Admin |
| PUT | `/:id` | Update quiz | Yes | Teacher/Admin |
| DELETE | `/:id` | Delete quiz | Yes | Teacher/Admin |
| POST | `/sync/offline` | Sync offline attempts | Yes | Student |

#### AI/ML (`/api/ml`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/evaluate` | Evaluate performance | Yes |
| POST | `/recommend` | Get lesson recommendations | Yes |
| GET | `/learning-gaps` | Detect learning gaps | Yes |
| POST | `/adaptive-hint` | Get adaptive hint | Yes |
| GET | `/student/dashboard` | Student dashboard data | Yes |
| GET | `/teacher/analytics` | Teacher analytics | Yes (Teacher) |

### Example API Calls

#### Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "student123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "Jane Student", "role": "student" },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### Get Recommendations
```javascript
POST /api/ml/recommend
Authorization: Bearer <token>
Content-Type: application/json

{
  "limit": 5
}

Response:
{
  "success": true,
  "message": "Recommendations generated successfully",
  "data": {
    "recommendations": [
      {
        "lesson": { "id": 2, "title": "Data Structures", ... },
        "score": 80,
        "reasons": ["Matches your intermediate level", "Prerequisites completed"]
      }
    ],
    "total": 5
  }
}
```

---

## 🌐 Deployment

### Deployment Options

#### 1. **Vercel (Frontend) + Render (Backend)**

**Frontend (Vercel):**
```powershell
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

**Backend (Render):**
- Connect GitHub repository
- Set build command: `pip install -r backend/requirements.txt`
- Set start command: `cd backend && gunicorn app:app`
- Add environment variables

#### 2. **Docker Deployment**

```powershell
# Build images
docker-compose -f docker-compose.yml build

# Push to container registry
docker tag ai_learning_backend your-registry/backend:latest
docker push your-registry/backend:latest

# Deploy to cloud provider (AWS ECS, Google Cloud Run, etc.)
```

#### 3. **Traditional VPS (AWS EC2, DigitalOcean)**

```bash
# Backend
cd backend
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app

# Frontend
cd frontend
npm run build
# Serve with Nginx
```

### Environment Variables for Production

**Backend (.env):**
```
FLASK_ENV=production
SECRET_KEY=<strong-secret-key>
JWT_SECRET_KEY=<strong-jwt-secret>
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ORIGINS=https://yourdomain.com
REDIS_URL=redis://redis:6379/0
```

**Frontend (.env):**
```
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=<your-client-id>
```

---

## 🎯 Demo Credentials

For testing the platform, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | student123 |
| Teacher | teacher@example.com | teacher123 |
| Admin | admin@example.com | admin123 |

---

## 🧪 Testing

### Backend Tests
```powershell
cd backend
pytest
```

### Frontend Tests
```powershell
cd frontend
npm test
```

### E2E Tests
```powershell
cd frontend
npx cypress open
```

---

## 📱 PWA Installation

### On Mobile
1. Open the site in Chrome/Safari
2. Tap "Add to Home Screen"
3. Access like a native app!

### On Desktop
1. Open in Chrome
2. Click the install icon in the address bar
3. Click "Install"

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Team Name** - *Initial work*

---

## 🙏 Acknowledgments

- BPUT Hackathon organizers
- Open source community
- All contributors

---

## 📧 Contact

For questions or support, please contact:
- Email: your-email@example.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/project/issues)

---

## 🗺️ Roadmap

- [ ] Video lesson support
- [ ] Peer-to-peer study groups
- [ ] Mobile app (React Native)
- [ ] Advanced AI models (Deep Learning)
- [ ] Multi-language support
- [ ] Voice-based interaction
- [ ] Gamification features
- [ ] Parent/guardian dashboard

---

**Made with ❤️ for accessible education**
