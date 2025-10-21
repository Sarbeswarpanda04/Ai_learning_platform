"""
Authentication routes for user signup, login, and OAuth
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime
from database import db
from models.user import User, StudentProfile
from utils.security import validate_email, sanitize_input, success_response, error_response
import os

# Google OAuth is optional
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_OAUTH_AVAILABLE = True
except ImportError:
    GOOGLE_OAUTH_AVAILABLE = False

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/check-email', methods=['GET'])
def check_email():
    """Check if email is already registered"""
    try:
        email = request.args.get('email', '').lower().strip()
        
        if not email:
            return error_response('Email parameter is required', 400)
        
        # Validate email format
        if not validate_email(email):
            return error_response('Invalid email format', 400)
        
        # Check if email exists
        user = User.query.filter_by(email=email).first()
        
        return success_response({
            'available': user is None,
            'email': email
        })
        
    except Exception as e:
        return error_response(f'Email check failed: {str(e)}', 500)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                return error_response(f'Missing required field: {field}', 400)
        
        # Sanitize inputs
        name = sanitize_input(data['name'])
        email = sanitize_input(data['email'].lower())
        password = data['password']
        role = data['role'].lower()
        
        # Validate email
        if not validate_email(email):
            return error_response('Invalid email format', 400)
        
        # Validate role
        if role not in ['student', 'teacher', 'admin']:
            return error_response('Invalid role. Must be student, teacher, or admin', 400)
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return error_response('Email already registered', 409)
        
        # Validate password strength
        if len(password) < 6:
            return error_response('Password must be at least 6 characters long', 400)
        
        # Create new user
        user = User(
            name=name,
            email=email,
            role=role
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create student profile if role is student
        if role == 'student':
            profile_data = data.get('profile', {})
            profile = StudentProfile(
                user_id=user.id,
                branch=profile_data.get('branch'),
                semester=profile_data.get('semester'),
                baseline_score=profile_data.get('baseline_score', 0),
                preferences=profile_data.get('preferences', {})
            )
            db.session.add(profile)
        
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return success_response({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 'User registered successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Registration failed: {str(e)}', 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT tokens"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return error_response('Email and password are required', 400)
        
        email = sanitize_input(data['email'].lower())
        password = data['password']
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return error_response('Invalid email or password', 401)
        
        if not user.is_active:
            return error_response('Account is deactivated', 403)
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # Get profile if student
        profile = None
        if user.role == 'student' and user.student_profile:
            profile = user.student_profile.to_dict()
        
        return success_response({
            'user': user.to_dict(),
            'profile': profile,
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 'Login successful')
        
    except Exception as e:
        return error_response(f'Login failed: {str(e)}', 500)


@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """Authenticate user with Google OAuth"""
    if not GOOGLE_OAUTH_AVAILABLE:
        return error_response('Google OAuth is not configured. Install google-auth library.', 501)
    
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return error_response('Google token is required', 400)
        
        # Verify Google token
        client_id = os.environ.get('GOOGLE_CLIENT_ID')
        if not client_id:
            return error_response('Google OAuth not configured', 500)
        
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                client_id
            )
            
            # Get user info from Google
            email = idinfo.get('email')
            name = idinfo.get('name')
            google_id = idinfo.get('sub')
            
            if not email:
                return error_response('Email not provided by Google', 400)
            
            # Check if user exists
            user = User.query.filter_by(email=email).first()
            
            if user:
                # Update OAuth info if needed
                if not user.oauth_provider:
                    user.oauth_provider = 'google'
                    user.oauth_id = google_id
                user.last_login = datetime.utcnow()
                db.session.commit()
            else:
                # Create new user
                role = data.get('role', 'student')  # Default to student
                user = User(
                    name=name,
                    email=email,
                    role=role,
                    oauth_provider='google',
                    oauth_id=google_id
                )
                db.session.add(user)
                db.session.flush()
                
                # Create student profile if student
                if role == 'student':
                    profile = StudentProfile(user_id=user.id)
                    db.session.add(profile)
                
                db.session.commit()
            
            # Generate tokens
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)
            
            return success_response({
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 'Google authentication successful')
            
        except ValueError as e:
            return error_response(f'Invalid Google token: {str(e)}', 401)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Google authentication failed: {str(e)}', 500)


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)
        
        return success_response({
            'access_token': access_token
        }, 'Token refreshed successfully')
        
    except Exception as e:
        return error_response(f'Token refresh failed: {str(e)}', 500)


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        profile = None
        if user.role == 'student' and user.student_profile:
            profile = user.student_profile.to_dict()
        
        return success_response({
            'user': user.to_dict(),
            'profile': profile
        })
        
    except Exception as e:
        return error_response(f'Failed to get user: {str(e)}', 500)


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        data = request.get_json()
        
        # Update user fields
        if 'name' in data:
            user.name = sanitize_input(data['name'])
        
        # Update student profile if applicable
        if user.role == 'student':
            profile = user.student_profile
            if not profile:
                profile = StudentProfile(user_id=user.id)
                db.session.add(profile)
            
            if 'branch' in data:
                profile.branch = sanitize_input(data['branch'])
            if 'semester' in data:
                profile.semester = data['semester']
            if 'preferences' in data:
                profile.preferences = data['preferences']
        
        db.session.commit()
        
        return success_response({
            'user': user.to_dict(),
            'profile': user.student_profile.to_dict() if user.student_profile else None
        }, 'Profile updated successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Profile update failed: {str(e)}', 500)


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return error_response('Current and new password required', 400)
        
        # Verify current password
        if not user.check_password(current_password):
            return error_response('Current password is incorrect', 401)
        
        # Validate new password
        if len(new_password) < 6:
            return error_response('New password must be at least 6 characters', 400)
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        return success_response(None, 'Password changed successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Password change failed: {str(e)}', 500)
