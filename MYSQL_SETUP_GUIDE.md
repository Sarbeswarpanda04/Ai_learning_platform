# MySQL Local Setup Guide 🗄️

## Overview
This guide helps you migrate from PostgreSQL (Render) to MySQL (localhost) for local development.

## Prerequisites ✅
- MySQL Server 8.0+ installed
- MySQL Workbench (optional but recommended)
- Python 3.8+
- pip package manager

---

## Step 1: Install MySQL 📥

### Windows:
1. Download from: https://dev.mysql.com/downloads/installer/
2. Run MySQL Installer
3. Choose "Developer Default" setup
4. Set root password (remember this!)
5. Complete installation

### Verify Installation:
```bash
mysql --version
```

---

## Step 2: Create Database 🏗️

### Option A: Using MySQL Workbench (Recommended)

1. Open MySQL Workbench
2. Connect to local MySQL server (root/your_password)
3. Click "Create new schema" button (or File → New Query Tab)
4. Run this command:
```sql
CREATE DATABASE ai_learning_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```
5. Click Execute (⚡ icon) or press Ctrl+Enter

### Option B: Using Command Line

```bash
mysql -u root -p
# Enter your MySQL root password

CREATE DATABASE ai_learning_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

---

## Step 3: Configure Backend 🔧

### 1. Update `.env` file:
```env
# Database Configuration (LOCAL MySQL)
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/ai_learning_db
```

**Replace `YOUR_PASSWORD` with your actual MySQL root password!**

Example:
```env
DATABASE_URL=mysql+pymysql://root:admin123@localhost:3306/ai_learning_db
```

### 2. Install Python MySQL Package:
```bash
cd backend
pip install pymysql==1.1.0 cryptography==41.0.7
```

---

## Step 4: Initialize Database Tables 🗂️

### Method 1: Using Python Script (Recommended)
```bash
cd backend
python init_db.py
```

This will:
- ✅ Create all tables automatically
- ✅ Create sample teacher/student accounts
- ✅ Setup relationships between tables

### Method 2: Using SQL Script (Manual)
1. Open `backend/mysql_setup.sql` in MySQL Workbench
2. Select all (Ctrl+A)
3. Click Execute (⚡)
4. Verify tables created: `SHOW TABLES;`

---

## Step 5: Verify Setup ✔️

### Check Tables Created:
```sql
USE ai_learning_db;
SHOW TABLES;
```

You should see:
- users
- student_profiles
- lessons
- materials
- quizzes
- quiz_questions
- attempts
- progress
- ai_feedback
- recommendations
- learning_analytics

### Check Sample Data:
```sql
SELECT * FROM users;
SELECT * FROM student_profiles;
```

---

## Step 6: Start Backend Server 🚀

```bash
cd backend
python app.py
```

### Expected Output:
```
============================================================
  AI-DRIVEN PERSONALIZED LEARNING PLATFORM
============================================================
  Environment: development
  Server running on: http://localhost:5000
  Debug mode: True
  ✅ Gemini API configured successfully
============================================================
```

---

## Step 7: Test API 🧪

### Method 1: Browser
Visit: http://localhost:5000/health

Expected response:
```json
{
  "status": "healthy",
  "message": "AI Learning Platform API is running",
  "version": "1.0.0"
}
```

### Method 2: Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@demo.com",
    "password": "student123"
  }'
```

---

## Default Login Credentials 🔑

### Teacher Account:
- **Email**: `teacher@demo.com`
- **Password**: `teacher123`

### Student Account:
- **Email**: `student@demo.com`
- **Password**: `student123`

---

## Troubleshooting 🔧

### Error: "Access denied for user"
**Solution**: Check MySQL password in `.env`
```env
DATABASE_URL=mysql+pymysql://root:CORRECT_PASSWORD@localhost:3306/ai_learning_db
```

### Error: "Unknown database 'ai_learning_db'"
**Solution**: Create database first
```sql
CREATE DATABASE ai_learning_db;
```

### Error: "Can't connect to MySQL server"
**Solution**: 
1. Check if MySQL is running: `services.msc` (Windows)
2. Start MySQL80 service if stopped
3. Verify port 3306 is not blocked

### Error: "No module named 'pymysql'"
**Solution**: Install package
```bash
pip install pymysql cryptography
```

### Error: Tables not created
**Solution**: Run init_db.py again
```bash
python init_db.py
```

---

## MySQL Workbench Quick Reference 📖

### View Data:
```sql
SELECT * FROM users LIMIT 10;
SELECT * FROM lessons WHERE subject = 'Mathematics';
```

### Count Records:
```sql
SELECT COUNT(*) FROM users WHERE role = 'student';
SELECT COUNT(*) FROM attempts WHERE user_id = 2;
```

### Check Database Size:
```sql
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'ai_learning_db';
```

### Backup Database:
```bash
mysqldump -u root -p ai_learning_db > backup.sql
```

### Restore Database:
```bash
mysql -u root -p ai_learning_db < backup.sql
```

---

## Advantages of Local MySQL 🎯

✅ **Faster Development** - No network latency
✅ **Offline Work** - Work without internet
✅ **Full Control** - Direct database access via Workbench
✅ **Free** - No cloud hosting costs during development
✅ **Easy Testing** - Reset database instantly
✅ **Better Debugging** - See queries in real-time

---

## Next Steps 📋

1. ✅ MySQL installed and running
2. ✅ Database created (`ai_learning_db`)
3. ✅ Backend configured (`.env` updated)
4. ✅ Tables initialized (`init_db.py` ran)
5. ✅ Backend server running (`python app.py`)
6. 🔄 Start frontend: `cd frontend && npm run dev`
7. 🎉 Access app: http://localhost:5173

---

## Database Schema Reference 📊

### Main Relationships:
```
users (1:N) → student_profiles
users (1:N) → lessons (as teacher)
lessons (1:N) → materials
lessons (1:N) → quizzes
quizzes (1:N) → attempts
users (1:N) → attempts (as student)
users (1:N) → progress
users (1:N) → ai_feedback
users (1:N) → recommendations
```

### Key Fields:
- **users.role**: 'student' | 'teacher' | 'admin'
- **lessons.difficulty**: 'beginner' | 'intermediate' | 'advanced'
- **attempts.status**: 'in_progress' | 'completed' | 'abandoned'
- **recommendations.status**: 'pending' | 'in_progress' | 'completed' | 'dismissed'

---

## Support 🆘

If you encounter any issues:
1. Check this guide's Troubleshooting section
2. Verify MySQL service is running
3. Check backend logs for error messages
4. Test database connection: `python init_db.py`

**Remember**: You're now running 100% locally! No Render, no cloud dependencies. Perfect for development! 🎉
