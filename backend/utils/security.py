"""
Utility functions for the AI Learning Platform
"""
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User

def generate_token(user_id, expires_in=3600):
    """Generate JWT token for user"""
    secret_key = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(seconds=expires_in)
    }
    return jwt.encode(payload, secret_key, algorithm='HS256')

def verify_token(token):
    """Verify JWT token"""
    secret_key = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def role_required(allowed_roles):
    """
    Decorator to check if user has required role
    Usage: @role_required(['admin', 'teacher'])
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.role not in allowed_roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def validate_email(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_input(text):
    """Basic input sanitization"""
    if not text:
        return text
    # Remove potential XSS
    text = text.replace('<script>', '').replace('</script>', '')
    text = text.replace('javascript:', '')
    return text.strip()

def calculate_score(correct_answers, total_questions, time_taken_seconds, max_time_seconds):
    """
    Calculate quiz score with time bonus
    
    Args:
        correct_answers: Number of correct answers
        total_questions: Total number of questions
        time_taken_seconds: Time taken to complete
        max_time_seconds: Maximum allowed time
        
    Returns:
        dict: Score breakdown
    """
    if total_questions == 0:
        return {
            'base_score': 0,
            'time_bonus': 0,
            'total_score': 0,
            'percentage': 0
        }
    
    # Base score (70% weight)
    base_score = (correct_answers / total_questions) * 70
    
    # Time bonus (30% weight) - faster completion gets bonus
    if time_taken_seconds <= max_time_seconds:
        time_ratio = time_taken_seconds / max_time_seconds
        time_bonus = (1 - time_ratio) * 30
    else:
        time_bonus = 0
    
    total_score = base_score + time_bonus
    percentage = (correct_answers / total_questions) * 100
    
    return {
        'base_score': round(base_score, 2),
        'time_bonus': round(time_bonus, 2),
        'total_score': round(total_score, 2),
        'percentage': round(percentage, 2)
    }

def format_time_ago(timestamp):
    """Format timestamp as 'X time ago'"""
    if not timestamp:
        return 'Never'
    
    now = datetime.utcnow()
    if isinstance(timestamp, str):
        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    
    diff = now - timestamp
    
    if diff.days > 365:
        return f"{diff.days // 365} year{'s' if diff.days // 365 > 1 else ''} ago"
    elif diff.days > 30:
        return f"{diff.days // 30} month{'s' if diff.days // 30 > 1 else ''} ago"
    elif diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        return f"{diff.seconds // 3600} hour{'s' if diff.seconds // 3600 > 1 else ''} ago"
    elif diff.seconds > 60:
        return f"{diff.seconds // 60} minute{'s' if diff.seconds // 60 > 1 else ''} ago"
    else:
        return "Just now"

def paginate_query(query, page=1, per_page=10):
    """
    Paginate a SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-indexed)
        per_page: Items per page
        
    Returns:
        dict: Pagination data
    """
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        'items': [item.to_dict() for item in paginated.items],
        'total': paginated.total,
        'page': page,
        'per_page': per_page,
        'total_pages': paginated.pages,
        'has_next': paginated.has_next,
        'has_prev': paginated.has_prev
    }

def success_response(data=None, message='Success', status_code=200):
    """Standard success response format"""
    response = {
        'success': True,
        'message': message
    }
    if data is not None:
        response['data'] = data
    return jsonify(response), status_code

def error_response(message='Error', status_code=400, errors=None):
    """Standard error response format"""
    response = {
        'success': False,
        'message': message
    }
    if errors:
        response['errors'] = errors
    return jsonify(response), status_code
