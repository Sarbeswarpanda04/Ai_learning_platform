"""
Database migration script to add email_verified column to users table
Run this once to update the database schema
"""
import os
import sys
from sqlalchemy import create_engine, text

# Get database URL from environment
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set")
    sys.exit(1)

# Fix postgres:// to postgresql://
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

print(f"Connecting to database...")

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if column already exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='email_verified'
        """)
        
        result = conn.execute(check_query)
        exists = result.fetchone() is not None
        
        if exists:
            print("✓ Column 'email_verified' already exists in users table")
        else:
            # Add the column
            print("Adding 'email_verified' column to users table...")
            
            alter_query = text("""
                ALTER TABLE users 
                ADD COLUMN email_verified BOOLEAN DEFAULT FALSE
            """)
            
            conn.execute(alter_query)
            conn.commit()
            
            print("✓ Successfully added 'email_verified' column")
            
            # Update existing users to have email_verified = True
            update_query = text("""
                UPDATE users 
                SET email_verified = TRUE 
                WHERE email_verified IS NULL
            """)
            
            conn.execute(update_query)
            conn.commit()
            
            print("✓ Updated existing users to verified status")
    
    print("\n✅ Migration completed successfully!")
    
except Exception as e:
    print(f"\n❌ Migration failed: {str(e)}")
    sys.exit(1)
