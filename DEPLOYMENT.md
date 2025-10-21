# 🚀 Deployment Guide

## Step 1: Push to GitHub

### 1.1 Initialize Git (if not already done)
```bash
cd "C:\Users\sarbe\OneDrive\Desktop\BPUT HACKATHON PROJECT\AI_Learning_Platform"
git init
```

### 1.2 Create .gitignore in root
Create a file named `.gitignore` in the root directory with:
```
# Environment files
.env
.env.local
*.env

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### 1.3 Add and Commit
```bash
git add .
git commit -m "Initial commit: AI Learning Platform"
```

### 1.4 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., "ai-learning-platform")
3. Don't initialize with README (we already have one)

### 1.5 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-learning-platform.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Sign Up/Login to Render
- Go to https://render.com
- Sign up or login with GitHub

### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ai-learning-platform-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose nearest to your location
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && pip install -r requirements-prod.txt`
   - **Start Command**: `gunicorn app:app`

### 2.3 Add Environment Variables
In Render dashboard, add these environment variables:

```
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this
JWT_SECRET_KEY=your-jwt-secret-key-change-this
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

### 2.4 Create PostgreSQL Database
1. In Render, click "New +" → "PostgreSQL"
2. Name: `ai-learning-platform-db`
3. Copy the **Internal Database URL**
4. Paste it as `DATABASE_URL` in your web service environment variables

### 2.5 Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Your backend URL: `https://ai-learning-platform-backend.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Update API URL
Before deploying, update the frontend to use your Render backend URL.

Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### 3.2 Update api.js
Open `frontend/src/utils/api.js` and update:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### 3.3 Push Changes to GitHub
```bash
git add .
git commit -m "Add production environment config"
git push
```

### 3.4 Deploy on Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.5 Add Environment Variables in Vercel
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### 3.6 Deploy
- Click "Deploy"
- Wait for deployment (2-3 minutes)
- Your frontend URL: `https://your-project.vercel.app`

---

## Step 4: Update CORS Settings

### 4.1 Update Backend CORS
Go to your Render dashboard → Environment Variables:

Update `CORS_ORIGINS`:
```
https://your-project.vercel.app,https://your-project-preview.vercel.app
```

### 4.2 Redeploy Backend
Click "Manual Deploy" → "Deploy latest commit"

---

## Step 5: Test Deployment

### 5.1 Test Backend
```bash
curl https://your-backend-url.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "message": "AI Learning Platform API is running"
}
```

### 5.2 Test Frontend
1. Visit `https://your-project.vercel.app`
2. Login with: `teacher@example.com` / `teacher123`
3. Navigate to `/lessons`
4. Check if lessons load from backend

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error**
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL database is running
- Check Render logs

**CORS Error**
- Verify `CORS_ORIGINS` includes your Vercel URL
- Make sure URLs have `https://` (not `http://`)
- Redeploy after changing environment variables

**500 Internal Server Error**
- Check Render logs: Dashboard → Logs
- Look for Python errors
- Ensure all dependencies in requirements.txt

### Frontend Issues

**API Connection Failed**
- Check `VITE_API_URL` points to Render backend
- Verify backend is running (check /health endpoint)
- Check browser console for CORS errors

**Build Failed**
- Check Node version (use Node 18+)
- Clear cache: `npm clean cache --force`
- Delete `node_modules` and reinstall

---

## 📱 Custom Domain (Optional)

### Vercel Custom Domain
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render Custom Domain
1. Render Dashboard → Settings → Custom Domain
2. Add your domain
3. Update DNS records (CNAME)

---

## 🔐 Security Checklist

- [ ] Change all SECRET_KEY values
- [ ] Use strong JWT_SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Set secure CORS_ORIGINS
- [ ] Use PostgreSQL (not SQLite) in production
- [ ] Add rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular security updates

---

## 📊 Monitoring

### Render
- Dashboard → Metrics
- View CPU, Memory, Response times
- Check logs for errors

### Vercel
- Dashboard → Analytics
- View page views, performance
- Check deployment logs

---

## 🎉 You're Done!

Your application is now live:
- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-backend-url.onrender.com

Share the frontend URL with users to access your AI Learning Platform!
