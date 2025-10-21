"""
Authentication routes for user signup, login, and OAuth
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy.exc import OperationalError, DBAPIError
from database import db
from models.user import User, StudentProfile
from utils.security import validate_email, sanitize_input, success_response, error_response
from utils.email_service import generate_otp, send_otp_email, store_otp, verify_otp, resend_otp
import os
import time

# Google OAuth is optional
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_OAUTH_AVAILABLE = True
except ImportError:
    GOOGLE_OAUTH_AVAILABLE = False

auth_bp = Blueprint('auth', __name__)

# Temporary storage for pending registrations (use Redis in production)
pending_registrations = {}

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
    """Register a new user - Step 1: Send OTP"""
    try:
        print("=== Signup Route Called ===")
        data = request.get_json()
        print(f"Request data: {data}")
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                print(f"Missing field: {field}")
                return error_response(f'Missing required field: {field}', 400)
        
        # Sanitize inputs
        name = sanitize_input(data['name'])
        email = sanitize_input(data['email'].lower())
        password = data['password']
        role = data['role'].lower()
        
        print(f"Sanitized - Name: {name}, Email: {email}, Role: {role}")
        
        # Validate email
        if not validate_email(email):
            print(f"Invalid email: {email}")
            return error_response('Invalid email format', 400)
        
        # Validate role
        if role not in ['student', 'teacher', 'admin']:
            print(f"Invalid role: {role}")
            return error_response('Invalid role. Must be student, teacher, or admin', 400)
        
        # Check if user already exists
        print("Checking for existing user...")
        try:
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                print(f"User already exists: {email}")
                return error_response('Email already registered', 409)
        except (OperationalError, DBAPIError) as e:
            print(f"Database error on first attempt: {str(e)}")
            # Retry once on database error
            time.sleep(1)
            db.session.rollback()
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                print(f"User already exists (retry): {email}")
                return error_response('Email already registered', 409)
        
        print("User check passed")
        
        # Validate password strength
        if len(password) < 6:
            print(f"Password too short: {len(password)} chars")
            return error_response('Password must be at least 6 characters long', 400)
        
        # Generate OTP
        print("Generating OTP...")
        otp = generate_otp()
        print(f"OTP generated: {otp}")
        
        # Store registration data temporarily
        print("Storing registration data...")
        pending_registrations[email] = {
            'name': name,
            'email': email,
            'password': password,
            'role': role,
            'preferred_subject': data.get('preferred_subject'),
            'profile': data.get('profile', {})
        }
        print(f"Registration data stored for: {email}")
        
        # Store OTP
        print("Storing OTP...")
        store_otp(email, otp)
        print("OTP stored successfully")
        
        # Try to send OTP email (with short timeout to avoid worker kill)
        print("Attempting to send OTP email...")
        try:
            email_sent = send_otp_email(email, otp, name)
            print(f"Email send result: {email_sent}")
        except Exception as email_error:
            print(f"Error sending email: {str(email_error)}")
            email_sent = False
        
        if email_sent:
            print("✅ Email sent successfully")
            return success_response({
                'email': email,
                'message': 'OTP sent to your email. Please check your inbox.'
            }, 'OTP sent successfully', 200)
        else:
            # Email failed - return OTP in response for testing
            print(f"⚠️  Email delivery failed - returning OTP in response for testing")
            print(f"⚠️  OTP for {email}: {otp}")
            return success_response({
                'email': email,
                'otp': otp,  # Include OTP for testing when email fails
                'message': 'OTP generated. Email delivery unavailable - OTP shown for testing.'
            }, 'OTP generated (email unavailable)', 200)
        
    except Exception as e:
        print(f"❌ Signup error: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f'Registration failed: {str(e)}', 500)


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp_endpoint():
    """Verify OTP and complete registration"""
    try:
        data = request.get_json()
        
        email = data.get('email', '').lower().strip()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return error_response('Email and OTP are required', 400)
        
        # Verify OTP
        success, message = verify_otp(email, otp)
        
        if not success:
            return error_response(message, 400)
        
        # Get pending registration data
        if email not in pending_registrations:
            return error_response('Registration data not found. Please signup again.', 400)
        
        reg_data = pending_registrations[email]
        
        # Create new user
        try:
            user = User(
                name=reg_data['name'],
                email=reg_data['email'],
                role=reg_data['role'],
                is_active=True,
                email_verified=True
            )
            user.set_password(reg_data['password'])
            
            db.session.add(user)
            db.session.flush()  # Get user ID
            
            # Create student profile if role is student
            if reg_data['role'] == 'student':
                profile_data = reg_data.get('profile', {})
                profile = StudentProfile(
                    user_id=user.id,
                    branch=profile_data.get('branch'),
                    semester=profile_data.get('semester'),
                    baseline_score=profile_data.get('baseline_score', 0),
                    preferences=profile_data.get('preferences', {})
                )
                db.session.add(profile)
            
            db.session.commit()
        except (OperationalError, DBAPIError) as e:
            # Retry once on database error
            time.sleep(1)
            db.session.rollback()
            
            user = User(
                name=reg_data['name'],
                email=reg_data['email'],
                role=reg_data['role'],
                is_active=True,
                email_verified=True
            )
            user.set_password(reg_data['password'])
            
            db.session.add(user)
            db.session.flush()
            
            if reg_data['role'] == 'student':
                profile_data = reg_data.get('profile', {})
                profile = StudentProfile(
                    user_id=user.id,
                    branch=profile_data.get('branch'),
                    semester=profile_data.get('semester'),
                    baseline_score=profile_data.get('baseline_score', 0),
                    preferences=profile_data.get('preferences', {})
                )
                db.session.add(profile)
            
            db.session.commit()
        
        # Remove from pending registrations
        del pending_registrations[email]
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # Get profile data if student
        profile_dict = None
        if user.role == 'student' and user.student_profile:
            profile_dict = user.student_profile.to_dict()
        
        return success_response({
            'user': user.to_dict(),
            'profile': profile_dict,
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 'Registration completed successfully!', 201)
        
    except (OperationalError, DBAPIError) as e:
        db.session.rollback()
        return error_response('Database connection error. Please try again in a moment.', 503)
    except Exception as e:
        db.session.rollback()
        return error_response(f'Verification failed: {str(e)}', 500)


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp_endpoint():
    """Resend OTP to email"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        
        if not email:
            return error_response('Email is required', 400)
        
        # Check if registration is pending
        if email not in pending_registrations:
            return error_response('No pending registration found for this email', 400)
        
        reg_data = pending_registrations[email]
        success, message = resend_otp(email, reg_data['name'])
        
        if success:
            return success_response({'email': email}, message, 200)
        else:
            return error_response(message, 500)
            
    except Exception as e:
        return error_response(f'Failed to resend OTP: {str(e)}', 500)


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
