"""
MySQL Database Setup Script for AI Learning Platform
This script creates the database and all necessary tables
Run this in MySQL Workbench or from command line
"""

# ============================================
# Step 1: Create Database
# ============================================
CREATE DATABASE IF NOT EXISTS ai_learning_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ai_learning_db;

# ============================================
# Step 2: Create Tables
# ============================================

# Table 1: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 2: student_profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    branch VARCHAR(100),
    semester INT,
    baseline_score FLOAT DEFAULT 0.0,
    preferences JSON,
    achievements JSON,
    total_lessons_completed INT DEFAULT 0,
    total_quizzes_taken INT DEFAULT 0,
    average_score FLOAT DEFAULT 0.0,
    parent_pin VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 3: lessons
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50),
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    content TEXT,
    duration INT DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_subject (subject),
    INDEX idx_difficulty (difficulty),
    INDEX idx_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 4: materials (attachments for lessons)
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type ENUM('pdf', 'docx', 'pptx', 'notes', 'video', 'audio', 'other') DEFAULT 'pdf',
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 5: quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit INT DEFAULT 0,
    passing_score FLOAT DEFAULT 60.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 6: quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer VARCHAR(500) NOT NULL,
    explanation TEXT,
    points INT DEFAULT 1,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_id (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 7: attempts (quiz results)
CREATE TABLE IF NOT EXISTS attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score FLOAT DEFAULT 0.0,
    max_score FLOAT DEFAULT 100.0,
    percentage FLOAT DEFAULT 0.0,
    answers JSON,
    wrong_topics TEXT,
    time_taken INT,
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'completed',
    attempt_number INT DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 8: progress (lesson completion tracking)
CREATE TABLE IF NOT EXISTS progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    lesson_id INT NOT NULL,
    completion_percent INT DEFAULT 0,
    video_progress INT DEFAULT 0,
    last_watched TIMESTAMP NULL,
    notes TEXT,
    bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_lesson (student_id, lesson_id),
    INDEX idx_student_id (student_id),
    INDEX idx_lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 9: ai_feedback
CREATE TABLE IF NOT EXISTS ai_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    lesson_id INT,
    weak_topics TEXT,
    feedback_text TEXT NOT NULL,
    feedback_type ENUM('lesson', 'quiz', 'general', 'performance') DEFAULT 'general',
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 10: recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    recommended_lesson_id INT,
    note_file VARCHAR(255),
    video_url VARCHAR(500),
    reason TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'dismissed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# Table 11: learning_analytics (for ML data)
CREATE TABLE IF NOT EXISTS learning_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value FLOAT NOT NULL,
    metadata JSON,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_metric_type (metric_type),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# ============================================
# Step 3: Insert Sample Data (Optional)
# ============================================

# Sample Teacher Account (password: teacher123)
INSERT INTO users (name, email, password_hash, role, is_active, email_verified) VALUES
('Demo Teacher', 'teacher@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5iFWPI5VXU0mK', 'teacher', TRUE, TRUE);

# Sample Student Account (password: student123)
INSERT INTO users (name, email, password_hash, role, is_active, email_verified) VALUES
('Demo Student', 'student@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5iFWPI5VXU0mK', 'student', TRUE, TRUE);

# Sample Student Profile
INSERT INTO student_profiles (user_id, branch, semester, baseline_score, parent_pin) VALUES
(2, 'Computer Science', 3, 75.0, '123456');

# ============================================
# Step 4: Verify Installation
# ============================================

# Check all tables
SHOW TABLES;

# Check users table
SELECT * FROM users;

# Check student_profiles table
SELECT * FROM student_profiles;

# Show table structure
DESCRIBE users;
DESCRIBE lessons;
DESCRIBE quizzes;
DESCRIBE attempts;

# ============================================
# Additional Utility Queries
# ============================================

# Get database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'ai_learning_db'
GROUP BY table_schema;

# Count records in each table
SELECT 
    TABLE_NAME,
    TABLE_ROWS
FROM information_schema.tables
WHERE TABLE_SCHEMA = 'ai_learning_db'
ORDER BY TABLE_NAME;
