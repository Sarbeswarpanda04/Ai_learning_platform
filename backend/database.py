from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app"""
    db.init_app(app)
    
    with app.app_context():
        # Import all models here to ensure they're registered
        from models.user import User, StudentProfile
        from models.lesson import Lesson
        from models.quiz import Quiz, Attempt
        
        # Create all tables
        db.create_all()
        print("Database initialized successfully!")
        
        # Create sample data if database is empty
        if User.query.count() == 0:
            create_sample_data()


def create_sample_data():
    """Create sample data for testing"""
    from models.user import User, StudentProfile
    from models.lesson import Lesson
    from models.quiz import Quiz
    import bcrypt
    
    try:
        # Create admin user
        admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
        admin = User(
            name='Admin User',
            email='admin@example.com',
            password_hash=admin_password.decode('utf-8'),
            role='admin'
        )
        db.session.add(admin)
        
        # Create teacher user
        teacher_password = bcrypt.hashpw('teacher123'.encode('utf-8'), bcrypt.gensalt())
        teacher = User(
            name='John Teacher',
            email='teacher@example.com',
            password_hash=teacher_password.decode('utf-8'),
            role='teacher'
        )
        db.session.add(teacher)
        
        # Create student user
        student_password = bcrypt.hashpw('student123'.encode('utf-8'), bcrypt.gensalt())
        student = User(
            name='Jane Student',
            email='student@example.com',
            password_hash=student_password.decode('utf-8'),
            role='student'
        )
        db.session.add(student)
        db.session.flush()  # Get the student ID
        
        # Create student profile
        profile = StudentProfile(
            user_id=student.id,
            branch='Computer Science',
            semester=3,
            baseline_score=60.0,
            preferences={'learning_style': 'visual', 'pace': 'moderate'}
        )
        db.session.add(profile)
        
        # Create sample lessons
        lessons_data = [
            {
                'title': 'Introduction to Python',
                'subject': 'Programming',
                'content': '# Python Basics\n\nPython is a high-level programming language...',
                'difficulty': 'beginner',
                'created_by': teacher.id
            },
            {
                'title': 'Data Structures in Python',
                'subject': 'Programming',
                'content': '# Data Structures\n\nLearn about lists, tuples, dictionaries...',
                'difficulty': 'intermediate',
                'created_by': teacher.id
            },
            {
                'title': 'Object-Oriented Programming',
                'subject': 'Programming',
                'content': '# OOP Concepts\n\nClasses, objects, inheritance...',
                'difficulty': 'intermediate',
                'created_by': teacher.id
            },
            {
                'title': 'Basic Calculus',
                'subject': 'Mathematics',
                'content': '# Calculus Introduction\n\nLimits, derivatives, integrals...',
                'difficulty': 'beginner',
                'created_by': teacher.id
            },
            {
                'title': 'Digital Electronics',
                'subject': 'Electronics',
                'content': '# Digital Logic\n\nLogic gates, Boolean algebra...',
                'difficulty': 'beginner',
                'created_by': teacher.id
            }
        ]
        
        for lesson_data in lessons_data:
            lesson = Lesson(**lesson_data)
            db.session.add(lesson)
        
        db.session.flush()  # Get lesson IDs
        
        # Create sample quizzes
        python_lesson = Lesson.query.filter_by(title='Introduction to Python').first()
        if python_lesson:
            quiz1 = Quiz(
                lesson_id=python_lesson.id,
                question='What is Python?',
                options=['A programming language', 'A snake', 'A database', 'An operating system'],
                correct_answer=0,
                difficulty='beginner',
                explanation='Python is a high-level, interpreted programming language.'
            )
            quiz2 = Quiz(
                lesson_id=python_lesson.id,
                question='Which keyword is used to define a function in Python?',
                options=['function', 'def', 'func', 'define'],
                correct_answer=1,
                difficulty='beginner',
                explanation='The "def" keyword is used to define functions in Python.'
            )
            db.session.add_all([quiz1, quiz2])
        
        db.session.commit()
        print("Sample data created successfully!")
        print("\nSample Login Credentials:")
        print("Admin - email: admin@example.com, password: admin123")
        print("Teacher - email: teacher@example.com, password: teacher123")
        print("Student - email: student@example.com, password: student123")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating sample data: {str(e)}")
