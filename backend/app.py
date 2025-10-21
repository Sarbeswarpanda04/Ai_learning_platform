"""
Main Flask application for AI-Driven Personalized Learning Platform
"""
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from config import config
from database import db, init_db

# Import routes
from routes.auth_routes import auth_bp
from routes.lesson_routes import lesson_bp
from routes.quiz_routes import quiz_bp
from routes.ml_routes import ml_bp
from routes.teacher_routes import teacher_routes
from routes.admin_routes import admin_bp
from routes.parent_routes import parent_routes

def create_app(config_name=None):
    """Application factory function"""
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Initialize CORS - Simple configuration to avoid duplicate headers
    CORS(app, 
         resources={r"/*": {"origins": "*"}},
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         supports_credentials=False)
    
    # JWT
    jwt = JWTManager(app)

    # Development-only request logger for Authorization header
    if app.config.get('DEBUG'):
        @app.before_request
        def _log_auth_header():
            try:
                auth = str(request.headers.get('Authorization'))
                if auth and auth != 'None':
                    print(f"[DEBUG] Incoming Authorization header: {auth[:100]}")
            except Exception:
                pass
    
    # Disable rate limiting and security headers for debugging
    # TODO: Re-enable after deployment is stable
    # if config_name != 'development':
    #     limiter = Limiter(
    #         app=app,
    #         key_func=get_remote_address,
    #         default_limits=["200 per day", "50 per hour"],
    #         storage_uri=app.config['RATELIMIT_STORAGE_URL']
    #     )
    
    # if config_name == 'production':
    #     Talisman(app, 
    #             force_https=True,
    #             strict_transport_security=True,
    #             content_security_policy=None)
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(lesson_bp, url_prefix='/api/lessons')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    app.register_blueprint(teacher_routes)
    app.register_blueprint(admin_bp)
    app.register_blueprint(parent_routes)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found',
            'error': str(error)
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error': str(error)
        }), 500
    
    @app.errorhandler(429)
    def ratelimit_handler(error):
        return jsonify({
            'success': False,
            'message': 'Rate limit exceeded. Please try again later.',
            'error': str(error)
        }), 429
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token has expired',
            'error': 'token_expired'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Invalid token',
            'error': 'invalid_token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Authorization token is missing',
            'error': 'authorization_required'
        }), 401
    
    # Serve uploaded files
    @app.route('/uploads/<filename>', methods=['GET'])
    def uploaded_file(filename):
        """Serve uploaded files (documents, videos, etc.)"""
        try:
            uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
            return send_from_directory(uploads_dir, filename)
        except FileNotFoundError:
            return jsonify({
                'success': False,
                'message': 'File not found',
                'error': 'file_not_found'
            }), 404
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'AI Learning Platform API is running',
            'version': '1.0.0'
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'Welcome to AI-Driven Personalized Learning Platform API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/health',
                'auth': '/api/auth',
                'lessons': '/api/lessons',
                'quiz': '/api/quiz',
                'ml': '/api/ml',
                'teacher': '/api/teacher',
                'uploads': '/uploads/<filename>'
            }
        }), 200
    
    return app


# Create application instance
app = create_app()

if __name__ == '__main__':
    # Run the application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    print("\n" + "="*60)
    print("  AI-DRIVEN PERSONALIZED LEARNING PLATFORM")
    print("="*60)
    print(f"  Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"  Server running on: http://localhost:{port}")
    print(f"  Debug mode: {debug}")
    print("="*60 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
