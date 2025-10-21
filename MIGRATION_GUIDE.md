# Database Migration Guide - Add Parent PIN Feature

## Problem
The `parent_pin` column is missing from the production database, causing student login failures with error:
```
psycopg2.errors.UndefinedColumn: column student_profiles.parent_pin does not exist
```

## Solution - Run Database Migration on Render

### Step 1: Access Render Shell
1. Go to your Render dashboard: https://dashboard.render.com
2. Navigate to your backend service (AI Learning Platform Backend)
3. Click on "Shell" tab in the left sidebar
4. This opens a terminal connected to your production environment

### Step 2: Run Migration Script
In the Render Shell, run:
```bash
python migrate_add_parent_pin.py
```

Expected output:
```
============================================================
Database Migration: Add parent_pin to student_profiles
============================================================
Database type: postgresql
Adding parent_pin column to student_profiles table...
✓ Successfully added parent_pin column to student_profiles table
  Students can now set their parent PIN from their dashboard

⚠ IMPORTANT: After this migration:
  1. Uncomment 'parent_pin' line in backend/models/user.py
  2. Redeploy the application
============================================================
Migration completed successfully!
============================================================
```

### Step 3: Re-enable parent_pin in Code

After successful migration, update the code:

In `backend/models/user.py`, change this:
```python
# parent_pin = db.Column(db.String(6))  # 6-digit PIN for parent access - TEMPORARILY COMMENTED
```

To this:
```python
parent_pin = db.Column(db.String(6))  # 6-digit PIN for parent access
```

### Step 4: Commit and Deploy
```bash
git add backend/models/user.py
git commit -m "Re-enable parent_pin column after production migration"
git push origin master
```

Render will auto-deploy, and the parent login feature will be fully functional.

## Verification

After deployment completes:
1. Test student login - should work without errors
2. Test parent login feature - should be fully functional
3. Students can set parent PIN from their dashboard

## Rollback (if needed)

If migration fails, the current temporary fix is already in place:
- `parent_pin` is commented out in the model
- Parent routes use defensive `getattr()` and `hasattr()` checks
- Student login works without the column

## Alternative: Manual SQL Migration

If you prefer to run SQL directly in Render's PostgreSQL console:

```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='student_profiles' 
  AND column_name='parent_pin';

-- Add column if not exists
ALTER TABLE student_profiles 
ADD COLUMN parent_pin VARCHAR(6);

-- Verify
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name='student_profiles' 
  AND column_name='parent_pin';
```

## Support

If you encounter any issues:
1. Check Render logs for error details
2. Verify database connection string is correct
3. Ensure you have proper database permissions
4. Contact support if migration continues to fail

---

**Current Status**: ✅ Temporary fix deployed (student login working)  
**Next Step**: 🔄 Run migration on production  
**Final Step**: ✅ Re-enable parent_pin in code
