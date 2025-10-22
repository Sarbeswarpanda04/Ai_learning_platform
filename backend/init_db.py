"""
Initialize MySQL database with all tables and sample data
Run this after configuring MySQL connection in .env
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app import create_app
from database import db
from models.user import User, StudentProfile
from models.lesson import Lesson
from models.quiz import Quiz

def init_database():
    """Initialize the MySQL database with all tables"""
    
    print("="*60)
    print("  AI LEARNING PLATFORM - MySQL DATABASE SETUP")
    print("="*60)
    
    # Create Flask app
    app = create_app('development')
    
    with app.app_context():
        print("\n📋 Database Configuration:")
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        # Hide password in output
        if '@' in db_uri:
            safe_uri = db_uri.split('@')[0].split('://')[0] + '://****:****@' + db_uri.split('@')[1]
            print(f"   Database URI: {safe_uri}")
        else:
            print(f"   Database URI: {db_uri}")
        
        try:
            # Test connection
            print("\n🔍 Testing database connection...")
            db.session.execute(db.text('SELECT 1'))
            print("   ✅ Database connection successful")
            
            # Check if tables exist
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if existing_tables:
                print(f"\n⚠️  Found {len(existing_tables)} existing tables")
                response = input("   Drop all tables and recreate? (yes/no): ")
                if response.lower() not in ['yes', 'y']:
                    print("\n❌ Database initialization cancelled")
                    return
                
                print("\n🗑️  Dropping existing tables...")
                db.drop_all()
                print("   ✅ All tables dropped")
            
            # Create all tables
            print("\n📦 Creating tables from models...")
            db.create_all()
            print("   ✅ All tables created successfully")
            
            # List all created tables
            print("\n📊 Created Tables:")
            inspector = db.inspect(db.engine)
            for table_name in inspector.get_table_names():
                print(f"   - {table_name}")
            
            # Check if sample data exists
            if User.query.first():
                print("\n⚠️  Sample data already exists")
                return
            
            # Create sample data
            print("\n👤 Creating sample users...")
            
            # Create teacher account
            teacher = User(
                name='Demo Teacher',
                email='teacher@demo.com',
                role='teacher',
                is_active=True,
                email_verified=True
            )
            teacher.set_password('teacher123')
            db.session.add(teacher)
            
            # Create student account
            student = User(
                name='Demo Student',
                email='student@demo.com',
                role='student',
                is_active=True,
                email_verified=True
            )
            student.set_password('student123')
            db.session.add(student)
            
            db.session.commit()
            print("   ✅ Sample users created")
            
            # Create student profile
            print("\n📝 Creating student profile...")
            profile = StudentProfile(
                user_id=student.id,
                branch='Computer Science',
                semester=3,
                baseline_score=75.0,
                preferences={'learning_pace': 'medium', 'preferred_time': 'evening'},
                achievements=[]
            )
            db.session.add(profile)
            db.session.commit()
            print("   ✅ Student profile created")
            
            print("\n" + "="*60)
            print("  ✅ DATABASE INITIALIZATION COMPLETE!")
            print("="*60)
            print("\n📌 Login Credentials:")
            print("   Teacher: teacher@demo.com / teacher123")
            print("   Student: student@demo.com / student123")
            print("\n📌 Next Steps:")
            print("   1. Start Flask backend: python app.py")
            print("   2. Access API at: http://localhost:5000")
            print("   3. Login with credentials above")
            print("\n")
            
        except Exception as e:
            print(f"\n❌ Error during database initialization:")
            print(f"   {str(e)}")
            print("\n💡 Troubleshooting:")
            print("   1. Ensure MySQL is running")
            print("   2. Check DATABASE_URL in .env file")
            print("   3. Verify MySQL credentials")
            print("   4. Create database first: CREATE DATABASE ai_learning_db;")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == '__main__':
    print("\n🚀 Starting MySQL database initialization...\n")
    init_database()
