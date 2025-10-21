"""
Database migration script to add parent_pin column to student_profiles table
Run this script after deploying the code changes
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
            columns = [col['name'] for col in inspector.get_columns('student_profiles')]
            
            if 'parent_pin' in columns:
                print("✓ parent_pin column already exists")
                return
            
            # Add parent_pin column
            with db.engine.connect() as conn:
                conn.execute(db.text(
                    "ALTER TABLE student_profiles ADD COLUMN parent_pin VARCHAR(6)"
                ))
                conn.commit()
            
            print("✓ Successfully added parent_pin column to student_profiles table")
            print("  Students can now set their parent PIN from their dashboard")
            
        except Exception as e:
            print(f"✗ Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    print("="*60)
    print("Database Migration: Add parent_pin to student_profiles")
    print("="*60)
    migrate_add_parent_pin()
    print("="*60)
    print("Migration completed successfully!")
    print("="*60)
