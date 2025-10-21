"""
Database utility functions with connection retry logic
"""
from functools import wraps
import time
from sqlalchemy.exc import OperationalError, DBAPIError
from database import db

def retry_on_db_error(max_retries=3, delay=1):
    """
    Decorator to retry database operations on connection errors
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except (OperationalError, DBAPIError) as e:
                    last_exception = e
                    error_msg = str(e).lower()
                    
                    # Only retry on connection errors
                    if any(err in error_msg for err in ['eof detected', 'connection', 'timeout', 'broken pipe']):
                        if attempt < max_retries - 1:
                            print(f"Database connection error (attempt {attempt + 1}/{max_retries}): {str(e)}")
                            
                            # Rollback any pending transaction
                            try:
                                db.session.rollback()
                            except:
                                pass
                            
                            # Close and dispose connections
                            try:
                                db.session.close()
                                db.engine.dispose()
                            except:
                                pass
                            
                            # Wait before retrying with exponential backoff
                            time.sleep(delay * (2 ** attempt))
                            continue
                    
                    # If not a connection error or out of retries, raise immediately
                    raise
            
            # If all retries failed, raise the last exception
            raise last_exception
        
        return wrapper
    return decorator


def get_or_create(model, defaults=None, **kwargs):
    """
    Get an existing instance or create a new one with retry logic
    """
    @retry_on_db_error()
    def _get_or_create():
        instance = db.session.query(model).filter_by(**kwargs).first()
        if instance:
            return instance, False
        else:
            params = dict((k, v) for k, v in kwargs.items())
            params.update(defaults or {})
            instance = model(**params)
            db.session.add(instance)
            db.session.flush()
            return instance, True
    
    return _get_or_create()


def safe_commit():
    """
    Commit with retry logic
    """
    @retry_on_db_error()
    def _commit():
        db.session.commit()
    
    return _commit()


def safe_query(query_func):
    """
    Execute a query with retry logic
    """
    @retry_on_db_error()
    def _query():
        return query_func()
    
    return _query()
