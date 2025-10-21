"""
Database migration script to add parent_pin column to student_profiles table
Run this script after deploying the code changes

PRODUCTION USAGE (on Render):
1. SSH into your Render instance or use Render Shell
2. Run: python migrate_add_parent_pin.py
3. After successful migration, uncomment parent_pin in models/user.py
4. Redeploy the application
"""
import os
import sys

# Add parent directory to path to import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from database import db

def migrate_add_parent_pin():
    """Add parent_pin column to student_profiles table"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column already exists
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            
            # Get database type
            db_type = db.engine.dialect.name
            print(f"Database type: {db_type}")
            
            columns = [col['name'] for col in inspector.get_columns('student_profiles')]
            
            if 'parent_pin' in columns:
                print("✓ parent_pin column already exists")
                return True
            
            print("Adding parent_pin column to student_profiles table...")
            
            # Add parent_pin column with proper transaction handling
            with db.engine.begin() as conn:
                if db_type == 'postgresql':
                    # PostgreSQL syntax
                    conn.execute(db.text(
                        "ALTER TABLE student_profiles ADD COLUMN parent_pin VARCHAR(6)"
                    ))
                else:
                    # SQLite/MySQL syntax
                    conn.execute(db.text(
                        "ALTER TABLE student_profiles ADD COLUMN parent_pin VARCHAR(6)"
                    ))
            
            print("✓ Successfully added parent_pin column to student_profiles table")
            print("  Students can now set their parent PIN from their dashboard")
            print("\n⚠ IMPORTANT: After this migration:")
            print("  1. Uncomment 'parent_pin' line in backend/models/user.py")
            print("  2. Redeploy the application")
            return True
            
        except Exception as e:
            print(f"✗ Migration failed: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            return False

if __name__ == '__main__':
    print("="*60)
    print("Database Migration: Add parent_pin to student_profiles")
    print("="*60)
    success = migrate_add_parent_pin()
    print("="*60)
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed. Please check the error above.")
    print("="*60)
    sys.exit(0 if success else 1)
