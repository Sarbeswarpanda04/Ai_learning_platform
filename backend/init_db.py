"""
Initialize database with sample data for production
Run this once after deploying to Render
"""
from app import app, db
from models import User, Lesson, StudentProfile
from werkzeug.security import generate_password_hash
from datetime import datetime

def init_database():
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        
        # Check if data already exists
        if User.query.first():
            print("Database already initialized!")
            return
        
        print("Creating sample users...")
        
        # Create teacher
        teacher = User(
            username='teacher',
            email='teacher@example.com',
            password_hash=generate_password_hash('teacher123'),
            full_name='Demo Teacher',
            role='teacher'
        )
        
        # Create students
        student1 = User(
            username='student1',
            email='student1@example.com',
            password_hash=generate_password_hash('student123'),
            full_name='Alice Johnson',
            role='student'
        )
        
        student2 = User(
            username='student2',
            email='student2@example.com',
            password_hash=generate_password_hash('student123'),
            full_name='Bob Smith',
            role='student'
        )
        
        db.session.add_all([teacher, student1, student2])
        db.session.commit()
        
        print("Creating student profiles...")
        
        profile1 = StudentProfile(
            user_id=student1.id,
            grade_level='10',
            learning_style='visual',
            interests=['Mathematics', 'Science']
        )
        
        profile2 = StudentProfile(
            user_id=student2.id,
            grade_level='11',
            learning_style='auditory',
            interests=['History', 'Literature']
        )
        
        db.session.add_all([profile1, profile2])
        db.session.commit()
        
        print("Creating sample lessons...")
        
        lessons = [
            Lesson(
                title='Introduction to Python Programming',
                subject='Computer Science',
                content='Learn the basics of Python programming language including variables, data types, and control structures.',
                difficulty='beginner',
                duration_minutes=45,
                teacher_id=teacher.id,
                tags=['python', 'programming', 'basics'],
                objectives=['Understand variables', 'Learn data types', 'Use control structures']
            ),
            Lesson(
                title='Advanced Mathematics: Calculus',
                subject='Mathematics',
                content='Explore differential and integral calculus with real-world applications.',
                difficulty='advanced',
                duration_minutes=60,
                teacher_id=teacher.id,
                tags=['calculus', 'mathematics', 'advanced'],
                objectives=['Master derivatives', 'Understand integrals', 'Apply to problems']
            ),
            Lesson(
                title='World History: Ancient Civilizations',
                subject='History',
                content='Study the rise and fall of ancient civilizations including Egypt, Greece, and Rome.',
                difficulty='intermediate',
                duration_minutes=50,
                teacher_id=teacher.id,
                tags=['history', 'ancient', 'civilizations'],
                objectives=['Learn about Egypt', 'Understand Greek culture', 'Study Roman empire']
            ),
            Lesson(
                title='Chemistry Basics: The Periodic Table',
                subject='Science',
                content='Introduction to chemical elements and the periodic table organization.',
                difficulty='beginner',
                duration_minutes=40,
                teacher_id=teacher.id,
                tags=['chemistry', 'science', 'periodic-table'],
                objectives=['Understand elements', 'Learn periodic table', 'Chemical properties']
            ),
            Lesson(
                title='English Literature: Shakespeare',
                subject='English',
                content='Analysis of Shakespearean works including Romeo and Juliet, Hamlet, and Macbeth.',
                difficulty='intermediate',
                duration_minutes=55,
                teacher_id=teacher.id,
                tags=['literature', 'shakespeare', 'english'],
                objectives=['Analyze themes', 'Understand characters', 'Literary techniques']
            )
        ]
        
        db.session.add_all(lessons)
        db.session.commit()
        
        print(f"✅ Database initialized successfully!")
        print(f"Created {User.query.count()} users")
        print(f"Created {Lesson.query.count()} lessons")
        print(f"\nLogin credentials:")
        print(f"Teacher: teacher@example.com / teacher123")
        print(f"Student: student1@example.com / student123")

if __name__ == '__main__':
    init_database()
